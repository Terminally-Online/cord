import { ComparisonOperator, ComparisonValue, EvmType, InputType, InputValues } from "../lib";
import { parseConditionalType } from "./types";
import { isEvmType } from "../validate";

export const parseTypeValue = (str: string): InputType => {
	if (str.startsWith('[') && str.endsWith(']')) {
		return parseConditionalType(str.slice(1, -1)).type;
	}
	return isEvmType(str) ? str as EvmType : { constant: str };
};

export const parseValue = (str: string): ComparisonValue =>
	str.startsWith('(') && str.endsWith(')')
		? { reference: Number(str.slice(1, -1)) }
		: str;

export const resolveValue = (
	value: ComparisonValue,
	values: InputValues
): string | undefined => {
	if (typeof value === "object") {
		return values.get(value.reference);
	}

	if (value.startsWith("(") && value.endsWith(")")) {
		return values.get(Number(value.slice(1, -1)));
	}

	return value;
};

export const compareValues = (
	left: ComparisonValue,
	operator: ComparisonOperator,
	right: ComparisonValue,
	values: InputValues
): boolean => {
	const value1 = resolveValue(left, values);
	const value2 = resolveValue(right, values);

	if (value1 === undefined || value2 === undefined) return false;

	if (!isNaN(Number(value1)) && !isNaN(Number(value2))) {
		const num1 = Number(value1);
		const num2 = Number(value2);

		switch (operator) {
			case "==":
				return num1 === num2;
			case "!=":
				return num1 !== num2;
			case ">":
				return num1 > num2;
			case "<":
				return num1 < num2;
			case ">=":
				return num1 >= num2;
			case "<=":
				return num1 <= num2;
		}
	}

	switch (operator) {
		case "==":
			return value1 === value2;
		case "!=":
			return value1 !== value2;
		case ">":
			return value1 > value2;
		case "<":
			return value1 < value2;
		case ">=":
			return value1 >= value2;
		case "<=":
			return value1 <= value2;
	}
};
