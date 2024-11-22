import { isEvmType, validateEvmValue } from "../validate";
import {
	EvmType,
	CompoundType,
	ConstantType,
	InputType,
	ComparisonOperator,
} from "../lib";

export const parseTypeString = (
	typeString: string
): {
	type: InputType;
	defaultValue?: string;
} => {
	if (typeString.startsWith("[") && typeString.endsWith("]")) {
		const inner = typeString.slice(1, -1);

		const match = inner.match(
			/^([^=<>!]+)(==|>=|<=|>|<|!=)([^?]+)\?(\w+):(\w+)$/
		);
		if (match) {
			const [_, leftStr, operator, rightStr, trueTypeStr, falseTypeStr] =
				match;

			const left =
				leftStr.startsWith("(") && leftStr.endsWith(")")
					? { reference: Number(leftStr.slice(1, -1)) }
					: leftStr;

			const right =
				rightStr.startsWith("(") && rightStr.endsWith(")")
					? { reference: Number(rightStr.slice(1, -1)) }
					: rightStr.trim();

			const trueType = isEvmType(trueTypeStr)
				? (trueTypeStr as EvmType)
				: { constant: trueTypeStr };

			const falseType = isEvmType(falseTypeStr)
				? (falseTypeStr as EvmType)
				: { constant: falseTypeStr };

			return {
				type: {
					left,
					operator: operator as ComparisonOperator,
					right,
					trueType,
					falseType,
				},
			};
		}
	}

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

export const parseCompoundType = (type: string): CompoundType | null => {
	const types = type.split(":");
	if (types.length === 1) return null;

	const [baseType, ...metadata] = types;
	if (!isEvmType(baseType) || !metadata.every(isEvmType)) return null;

	return {
		baseType: baseType as EvmType,
		metadata: metadata as EvmType[],
	};
};
