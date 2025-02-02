import { EvmType, ConstantType, InputType, ComparisonOperator } from "../lib";
import { isEvmType, validateEvmValue } from "../validate";
import { parseTypeValue, parseValue } from "./values";

export const parseConditionalType = (inner: string): { type: InputType } => {
	const questionIndex = inner.indexOf("?");
	if (questionIndex === -1)
		throw new Error("Missing question mark in conditional");

	const condition = inner.substring(0, questionIndex);
	const remainingPart = inner.substring(questionIndex + 1);

	let colonIndex = -1;
	let inBrackets = 0;
	for (let i = 0; i < remainingPart.length; i++) {
		if (remainingPart[i] === "[") inBrackets++;
		if (remainingPart[i] === "]") inBrackets--;
		if (remainingPart[i] === ":" && inBrackets === 0) {
			colonIndex = i;
			break;
		}
	}

	if (colonIndex === -1) throw new Error("Missing colon in conditional");

	const trueStr = remainingPart.substring(0, colonIndex).trim();
	const falseStr = remainingPart.substring(colonIndex + 1).trim();

	const conditionMatch = condition.match(
		/^([^=<>!]+)(==|>=|<=|>|<|!=)([^?]+)$/,
	);
	if (!conditionMatch) throw new Error("Invalid condition format");
	const [_, leftStr, operator, rightStr] = conditionMatch;

	return {
		type: {
			left: parseValue(leftStr.trim()),
			operator: operator as ComparisonOperator,
			right: parseValue(rightStr.trim()),
			trueType: parseTypeValue(trueStr),
			falseType: parseTypeValue(falseStr),
		},
	};
};

export const parseRegularType = (typeString: string, defaultValue?: string) => {
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
						: `Invalid default value "${partDefaultValue}" for type ${type}`,
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

	if (defaultValue !== undefined) {
		return { type, defaultValue };
	}

	const definedDefaults = defaults.filter(
		(d): d is string => d !== undefined,
	);
	const finalDefaultValue =
		definedDefaults.length > 0 ? definedDefaults.join(":") : undefined;

	return { type, defaultValue: finalDefaultValue };
};

export const parseTypeString = (
	typeString: string,
): {
	type: InputType;
	defaultValue?: string;
} => {
	if (typeString.startsWith("[")) {
		let bracketCount = 1;
		let i = 1;

		while (i < typeString.length && bracketCount > 0) {
			if (typeString[i] === "[") bracketCount++;
			if (typeString[i] === "]") bracketCount--;
			i++;
		}

		if (bracketCount !== 0) {
			throw new Error("Unmatched brackets in conditional type");
		}

		const conditionalPart = typeString.substring(0, i);
		const remainingPart = typeString.substring(i);

		const defaultMatch = remainingPart.match(/^=(.+)$/);
		const defaultValue = defaultMatch ? defaultMatch[1] : undefined;

		const parsedType = parseConditionalType(conditionalPart.slice(1, -1));

		if (defaultValue !== undefined) {
			const type = parsedType.type;
			if (typeof type === "object" && "trueType" in type) {
				const isValidForTrue = validateEvmValue(
					defaultValue,
					type.trueType,
				);
				const isValidForFalse = validateEvmValue(
					defaultValue,
					type.falseType,
				);

				if (!isValidForTrue && !isValidForFalse) {
					throw new Error(
						`Invalid default value "${defaultValue}" for conditional type`,
					);
				}
			}
		}

		return { type: parsedType.type, defaultValue };
	}

	return parseRegularType(typeString);
};
