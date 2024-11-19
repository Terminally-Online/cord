import { isEvmType, validateInputSequence } from "./validate";
import {
    PLACEHOLDER_PATTERN,
    InputReference,
    ParsedCordSentence,
    Result,
    EvmType,
    CompoundType,
} from "./lib";

export const parseCordSentence = (
    sentence: string
): Result<ParsedCordSentence> => {
    try {
        const inputs: InputReference[] = [];

        const template = sentence.replace(
            PLACEHOLDER_PATTERN,
            (_, index, name, type, typeMetadata, dependentOn, delimiter) => {
                inputs.push({
                    index: Number(index),
                    ...(name && { name }),
                    ...(type && { type: type as EvmType }),
                    ...(typeMetadata && { typeMetadata }),
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
