import {
	ComparisonOperator,
	ComparisonValue,
	EvmType,
	InputType,
	InputValues,
} from "../lib";
import { parseConditionalType } from "./types";
import { isEvmType } from "../validate";

export const parseTypeValue = (str: string): InputType => {
	if (str.startsWith("[") && str.endsWith("]")) {
		return parseConditionalType(str.slice(1, -1)).type;
	}
	return isEvmType(str) ? (str as EvmType) : { constant: str };
};

export const parseValue = (value: string): ComparisonValue => {
	const referenceMatch = value.match(/^\((\d+)(?:\.(\d+))?\)$/);
	if (referenceMatch) {
		const [_, index, part] = referenceMatch;
		return {
			reference: Number(index),
			...(part && { part: Number(part) }),
		};
	}
	return value;
};

export const resolveValue = (
	value: ComparisonValue,
	values: InputValues,
): string | undefined => {
	if (typeof value === "object") {
		return values.get(value.reference)?.value;
	}

	if (value.startsWith("(") && value.endsWith(")")) {
		return values.get(Number(value.slice(1, -1)))?.value;
	}

	return value;
};

export const compareValues = (
	left: ComparisonValue,
	operator: ComparisonOperator,
	right: ComparisonValue,
	values: InputValues,
): boolean => {
	const resolveValue = (value: ComparisonValue): string => {
		if (typeof value === "object") {
			const rawValue = values.get(value.reference)?.value;
			if (!rawValue) return "";

			if (value.part !== undefined) {
				const parts = rawValue.split(":");
				return parts[value.part] || "";
			}
			return rawValue;
		}
		return value;
	};

	const leftValue = resolveValue(left);
	const rightValue = resolveValue(right);

	switch (operator) {
		case "==":
			return leftValue === rightValue;
		case "!=":
			return leftValue !== rightValue;
		case ">":
			return Number(leftValue) > Number(rightValue);
		case ">=":
			return Number(leftValue) >= Number(rightValue);
		case "<":
			return Number(leftValue) < Number(rightValue);
		case "<=":
			return Number(leftValue) <= Number(rightValue);
	}
};
