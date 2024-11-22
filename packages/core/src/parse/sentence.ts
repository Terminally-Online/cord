import {
	ParsedCordSentence,
	Result,
	InputReference,
	PLACEHOLDER_PATTERN,
} from "../lib";
import { parseTypeString } from "./types";
import { validateInputSequence } from "../validate";
import { compareValues } from "./comparison";

export const parseCordSentence = (
	sentence: string
): Result<ParsedCordSentence> => {
	try {
		const inputs: InputReference[] = [];
		const values = new Map<number, string>();

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

					if (defaultValue) {
						values.set(inputIndex, defaultValue);
					}
					return `{${index}}`;
				} catch (error) {
					throw new Error(
						error instanceof Error
							? error.message
							: "Type parsing error"
					);
				}
			}
		);

		inputs.forEach((input) => {
			if (
				input.type &&
				typeof input.type === "object" &&
				"left" in input.type
			) {
				const conditionMet = compareValues(
					input.type.left,
					input.type.operator,
					input.type.right,
					values
				);

				const resolvedType = conditionMet
					? input.type.trueType
					: input.type.falseType;

				if (
					typeof resolvedType === "object" &&
					"constant" in resolvedType
				) {
					values.set(input.index, resolvedType.constant);
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
