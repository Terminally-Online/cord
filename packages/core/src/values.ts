import { InputValues, ParsedCordSentence, Result, SetValueResult } from "./lib";
import { compareValues } from "./parse";
import { validateCompoundValue, validateEvmValue } from "./validate";

export const setValue = ({
	parsedSentence,
	currentValues,
	index,
	value,
}: {
	parsedSentence: ParsedCordSentence;
	currentValues: InputValues;
	index: number;
	value: string;
}): SetValueResult => {
	const input = parsedSentence.inputs[index];
	if (!input?.type) {
		return {
			success: true,
			value: currentValues,
			error: "Invalid input",
		};
	}

	let validationError: string | undefined;
	const newValues = new Map(currentValues);

	// Handle direct null type
	if (input.type === "null") {
		newValues.delete(index);
		return {
			success: true,
			value: newValues,
		};
	}

	// Handle conditional types
	if (typeof input.type === "object" && "left" in input.type) {
		const conditionMet = compareValues(
			input.type.left,
			input.type.operator,
			input.type.right,
			newValues
		);
		const activeType = conditionMet
			? input.type.trueType
			: input.type.falseType;

		if (activeType === "null") {
			newValues.delete(index);
			return {
				success: true,
				value: newValues,
			};
		}

		if (!validateEvmValue(value, activeType)) {
			validationError = "Invalid value for conditional type";
		}
	} else if (typeof input.type === "object" && "baseType" in input.type) {
		if (!validateCompoundValue(value, input.type)) {
			validationError = "Invalid compound value";
		}
	} else if (!validateEvmValue(value, input.type)) {
		validationError = "Invalid value";
	}

	const currentValue = currentValues.get(index)?.value;
	if (currentValue === value) {
		return {
			success: true,
			value: currentValues,
			error: validationError,
		};
	}

	newValues.set(index, { value: value });

	// Process other inputs for conditional types and null types
	parsedSentence.inputs.forEach((otherInput) => {
		if (otherInput.index === index) return;

		if (
			otherInput.type &&
			typeof otherInput.type === "object" &&
			"left" in otherInput.type
		) {
			const conditionMet = compareValues(
				otherInput.type.left,
				otherInput.type.operator,
				otherInput.type.right,
				newValues
			);
			const resolvedType = conditionMet
				? otherInput.type.trueType
				: otherInput.type.falseType;

			if (resolvedType === "null") {
				newValues.delete(otherInput.index);
			} else if (
				typeof resolvedType === "object" &&
				"constant" in resolvedType
			) {
				newValues.set(otherInput.index, {
					value: resolvedType.constant,
					isDisabled: true,
				});
			} else {
				// If the type is no longer a constant, remove the isDisabled flag
				const existingValue = newValues.get(otherInput.index);
				if (existingValue?.isDisabled) {
					newValues.set(otherInput.index, {
						value: existingValue.value,
					});
				}
			}
		}
	});

	// Handle dependencies
	const hasDependents = parsedSentence.inputs.some(
		(input) => input.dependentOn === index
	);
	if (hasDependents) {
		parsedSentence.inputs.forEach((input) => {
			if (input.dependentOn === index) {
				newValues.delete(input.index);
			}
		});
	}

	return {
		success: true,
		value: newValues,
		error: validationError,
	};
};

export const resolveSentence = (
	parsedSentence: ParsedCordSentence,
	values?: InputValues
): Result<string> => {
	try {
		const resolveValues = values || parsedSentence.values;
		const resolved = parsedSentence.template.replace(
			/\{(\d+)\}/g,
			(_: string, index: string) => {
				const numberIndex = Number(index);
				const value = resolveValues.get(numberIndex);
				if (value === undefined) {
					throw new Error(`Missing value for input ${index}`);
				}
				if (typeof value === "string") {
					return value;
				}
				if ("value" in value) {
					return value.value;
				}
				throw new Error(`Invalid value format for input ${index}`);
			}
		);
		return { success: true, value: resolved };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Resolution error",
		};
	}
};
