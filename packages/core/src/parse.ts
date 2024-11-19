import { isEvmType, validateEvmValue, validateInputSequence } from "./validate";
import {
    PLACEHOLDER_PATTERN,
    InputReference,
    ParsedCordSentence,
    Result,
    EvmType,
    CompoundType,
} from "./lib";

const parseTypeString = (
    typeString: string
): {
    type: EvmType | CompoundType;
    defaultValue?: string;
} => {
    const parts = typeString.split(":");
    const types: EvmType[] = [];
    const defaults: (string | undefined)[] = [];

    parts.forEach((part) => {
        const [typeStr, defaultValue] = part.split("=");

        if (!isEvmType(typeStr)) {
            throw new Error(`Invalid type: ${typeStr}`);
        }

        if (defaultValue !== undefined) {
            if (!validateEvmValue(defaultValue, typeStr as EvmType)) {
                throw new Error(
                    `Invalid default value "${defaultValue}" for type ${typeStr}`
                );
            }
        }

        types.push(typeStr as EvmType);
        defaults.push(defaultValue);
    });

    const type =
        types.length > 1
            ? {
                  baseType: types[0],
                  metadata: types.slice(1),
              }
            : types[0];

    const definedDefaults = defaults.filter(
        (d): d is string => d !== undefined
    );
    const defaultValue =
        definedDefaults.length > 0 ? definedDefaults.join(":") : undefined;

    return { type, defaultValue };
};
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
