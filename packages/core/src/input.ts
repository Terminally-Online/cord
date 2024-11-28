import { InputState, InputType } from "./lib";
import { compareValues } from "./parse";

export const isConstantType = (
	type: InputType | undefined
): { isConstant: boolean; value?: string } => {
	if (!type) return { isConstant: false };
	if (typeof type === "object" && "constant" in type) {
		return { isConstant: true, value: type.constant };
	}
	return { isConstant: false };
};

export const shouldRenderInput = (
	type: InputType | undefined,
	inputs: Array<{ index: number }>,
	getInputValue: (index: number) => InputState | undefined
): boolean => {
	if (!type) return true;
	if (type === "null") return false;
	if (typeof type === "object" && "left" in type) {
		const conditionMet = compareValues(
			type.left,
			type.operator,
			type.right,
			new Map(
				inputs.map((i) => {
					const value = getInputValue(i.index);
					return [i.index, { value: value?.value || "" }];
				})
			)
		);
		const resolvedType = conditionMet ? type.trueType : type.falseType;
		return resolvedType !== "null";
	}
	return true;
};

export const getTypeDescription = (type: InputType | undefined): string => {
	if (!type) return "";

	if (typeof type === "string") {
		return `Type: ${type}`;
	}

	if ("constant" in type) {
		return `Must be: "${type.constant}"`;
	}

	if ("baseType" in type) {
		return `Type: ${type.baseType} with ${type.metadata.join(", ")}`;
	}

	if ("left" in type) {
		return "Conditional type";
	}

	return "";
};

export const getInputPlaceholder = (type: InputType | undefined): string => {
	if (!type) return "";

	if (typeof type === "string") {
		switch (type) {
			case "uint256":
				return "Enter a positive number";
			case "address":
				return "0x...";
			case "bool":
				return "true or false";
			case "string":
				return "Enter text";
			default:
				return `Enter ${type}`;
		}
	}

	if ("constant" in type) {
		return `Must be: ${type.constant}`;
	}

	if ("baseType" in type) {
		return `Enter ${type.baseType} value`;
	}

	return "Enter value";
};
