import { validateInputSequence } from "./validate";
import {
    PLACEHOLDER_PATTERN,
    InputReference,
    ParsedCordSentence,
    Result,
} from "./lib";

export const parseCordSentence = (
    sentence: string
): Result<ParsedCordSentence> => {
    try {
        const inputs: InputReference[] = [];

        const template = sentence.replace(
            PLACEHOLDER_PATTERN,
            (_, index, dependentOn, delimiter) => {
                inputs.push({
                    index: Number(index),
                    ...(dependentOn && { dependentOn: Number(dependentOn) }),
                    ...(delimiter && { delimiter }),
                });

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
