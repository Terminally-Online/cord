import {
	EvmType,
	ConstantType,
	InputType,
	ComparisonOperator,
	ComparisonValue,
} from "../lib";
import { isEvmType, validateEvmValue } from "../validate";

export const parseValue = (str: string): ComparisonValue =>
	str.startsWith("(") && str.endsWith(")")
		? { reference: Number(str.slice(1, -1)) }
		: str;

export const parseTypeValue = (str: string): InputType =>
	str.startsWith("[") && str.endsWith("]")
		? parseConditionalType(str.slice(1, -1)).type
		: isEvmType(str)
			? str as EvmType
			: { constant: str };

export const parseConditionalType = (inner: string): { type: InputType } => {
	const match = inner.match(/^([^=<>!]+)(==|>=|<=|>|<|!=)([^?]+)\?([^:]+):(.+)$/);
	if (!match) throw new Error("Invalid conditional type syntax");

	const [_, leftStr, operator, rightStr, trueTypeStr, falseStr] = match;

	return {
		type: {
			left: parseValue(leftStr),
			operator: operator as ComparisonOperator,
			right: parseValue(rightStr.trim()),
			trueType: parseTypeValue(trueTypeStr),
			falseType: parseTypeValue(falseStr)
		}
	};
};

export const parseRegularType = (typeString: string) => {
	const parts = typeString.split(":");
	const types: (EvmType | ConstantType)[] = [];
	const defaults: (string | undefined)[] = [];

	parts.forEach((part) => {
		const [partTypeStr, partDefaultValue] = part.split("=");
		const type: EvmType | ConstantType = isEvmType(partTypeStr)
			? (partTypeStr as EvmType)
			: { constant: partTypeStr };
		if (partDefaultValue !== undefined) {
			if (!validateEvmValue(partDefaultValue, type)) {
				throw new Error(
					typeof type === "object"
						? `Invalid default value "${partDefaultValue}" for constant(${type.constant})`
						: `Invalid default value "${partDefaultValue}" for type ${type}`
				);
			}
		}
		types.push(type);
		defaults.push(partDefaultValue);
	});

	const type: InputType =
		types.length > 1
			? {
				baseType: types[0],
				metadata: types.slice(1),
			}
			: types[0];

	const definedDefaults = defaults.filter(
		(d): d is string => d !== undefined
	);
	const finalDefaultValue =
		definedDefaults.length > 0 ? definedDefaults.join(":") : undefined;

	return { type, defaultValue: finalDefaultValue };
};

export const parseTypeString = (
	typeString: string
): {
	type: InputType;
	defaultValue?: string;
} => {
	if (typeString.startsWith("[") && typeString.endsWith("]")) {
		return parseConditionalType(typeString.slice(1, -1));
	}

	return parseRegularType(typeString);
};
