import {
    ParsedCordSentence,
    Result,
    InputReference,
    PLACEHOLDER_PATTERN,
} from "../lib";
import { parseTypeString } from "./types";
import { validateInputSequence } from "../validate";

export const parseCordSentence = (
    sentence: string
): Result<ParsedCordSentence> => {
    try {
        const inputs: InputReference[] = [];
        const template = sentence.replace(
            PLACEHOLDER_PATTERN,
            (_, dependentOn, index, name, typeString, delimiter) => {
                if (typeString) {
                    try {
                        const { type, defaultValue } =
                            parseTypeString(typeString);
                        inputs.push({
                            index: Number(index),
                            ...(dependentOn && {
                                dependentOn: Number(dependentOn),
                            }),
                            ...(name && { name }),
                            type,
                            ...(defaultValue && { defaultValue }),
                            ...(delimiter && { delimiter }),
                        });
                    } catch (e: unknown) {
                        throw new Error(
                            `Invalid type definition at index ${index}: ${
                                e instanceof Error ? e.message : "Unknown error"
                            }`
                        );
                    }
                } else {
                    inputs.push({
                        index: Number(index),
                        ...(dependentOn && {
                            dependentOn: Number(dependentOn),
                        }),
                        ...(name && { name }),
                        ...(delimiter && { delimiter }),
                    });
                }
                return `{${index}}`;
            }
        );

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
            },
        };
    } catch (error: unknown) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown parsing error",
        };
    }
};
