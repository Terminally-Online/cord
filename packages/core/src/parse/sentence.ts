import {
	ParsedCordSentence,
	Result,
	InputReference,
	PLACEHOLDER_PATTERN,
	InputType,
	InputState,
} from "../lib";
import { parseTypeString } from "./types";
import { validateInputSequence } from "../validate";
import { compareValues } from "./values";

export const parseCordSentence = (
	sentence: string,
): Result<ParsedCordSentence> => {
	try {
		const inputs: InputReference[] = [];
		const values = new Map<number, InputState>();

		const template = sentence.replace(
			PLACEHOLDER_PATTERN,
			(_, dependentOn, index, name, typeString, delimiter) => {
				try {
					const inputIndex = Number(index);
					const { type, defaultValue } = typeString
						? parseTypeString(typeString)
						: ({} as Partial<InputReference>);
					inputs.push({
						index: inputIndex,
						...(dependentOn && {
							dependentOn: Number(dependentOn),
						}),
						...(name && { name }),
						...(type && { type }),
						...(defaultValue && { defaultValue }),
						...(delimiter && { delimiter }),
					});
					if (
						type &&
						typeof type === "object" &&
						"constant" in type
					) {
						values.set(inputIndex, {
							value: type.constant,
							isDisabled: true,
						});
					} else if (defaultValue) {
						values.set(inputIndex, { value: defaultValue });
					}
					return `{${index}}`;
				} catch (error) {
					throw new Error(
						error instanceof Error
							? error.message
							: "Type parsing error",
					);
				}
			},
		);

		const evaluateConditionalType = (
			type: InputType,
			inputIndex: number,
		): InputType => {
			if (typeof type === "object" && "left" in type) {
				const conditionMet = compareValues(
					type.left,
					type.operator,
					type.right,
					values,
				);

				const resolvedType = evaluateConditionalType(
					conditionMet ? type.trueType : type.falseType,
					inputIndex,
				);

				if (
					typeof resolvedType === "object" &&
					"constant" in resolvedType
				) {
					values.set(inputIndex, {
						value: resolvedType.constant,
						isDisabled: true,
					});
				}

				return resolvedType;
			}
			return type;
		};

		inputs.forEach((input) => {
			if (
				input.type &&
				typeof input.type === "object" &&
				"left" in input.type
			) {
				const resolvedType = evaluateConditionalType(
					input.type,
					input.index,
				);
				if (
					typeof resolvedType === "object" &&
					"constant" in resolvedType
				) {
					values.set(input.index, {
						value: resolvedType.constant,
						isDisabled: true,
					});
				}
			}
		});

		if (!validateInputSequence(inputs)) {
			return {
				success: false,
				error: "Invalid input sequence: indices must be sequential",
			};
		}

		return {
			success: true,
			value: {
				raw: sentence,
				template,
				inputs,
				values,
			},
		};
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Unknown parsing error",
		};
	}
};
