import { isEvmType, validateEvmValue } from "../validate";
import {
    EvmType,
    CompoundType,
    ConstantType,
    InputType,
    ConditionalType,
    ComparisonOperator,
} from "../lib";

export const parseTypeString = (
    typeString: string
): {
    type: InputType;
    defaultValue?: string;
} => {
    // Check for conditional type first
    if (typeString.startsWith("[") && typeString.endsWith("]")) {
        const inner = typeString.slice(1, -1);
        // Updated regex to handle string values
        const match = inner.match(
            /^\((\d+)\)(==|>=|<=|>|<|!=)([^?]+)\?(\w+):(\w+)$/
        );
        if (match) {
            const [
                _,
                reference,
                operator,
                checkValue,
                trueTypeStr,
                falseTypeStr,
            ] = match;

            const trueType = isEvmType(trueTypeStr)
                ? (trueTypeStr as EvmType)
                : { constant: trueTypeStr };

            const falseType = isEvmType(falseTypeStr)
                ? (falseTypeStr as EvmType)
                : { constant: falseTypeStr };

            return {
                type: {
                    reference: Number(reference),
                    operator: operator as ComparisonOperator,
                    checkValue,
                    trueType,
                    falseType,
                },
            };
        }
    }

    // Handle non-conditional types with defaults
    const parts = typeString.split(":");
    const types: (EvmType | ConstantType)[] = [];
    const defaults: (string | undefined)[] = [];

    parts.forEach((part) => {
        const [partTypeStr, partDefaultValue] = part.split("=");

        const type: EvmType | ConstantType = isEvmType(partTypeStr)
            ? (partTypeStr as EvmType)
            : { constant: partTypeStr };

        if (partDefaultValue !== undefined) {
            if (!validateEvmValue(partDefaultValue, type)) {
                throw new Error(
                    typeof type === "object"
                        ? `Invalid default value "${partDefaultValue}" for constant(${type.constant})`
                        : `Invalid default value "${partDefaultValue}" for type ${type}`
                );
            }
        }

        types.push(type);
        defaults.push(partDefaultValue);
    });

    const type: InputType =
        types.length > 1
            ? {
                  baseType: types[0],
                  metadata: types.slice(1),
              }
            : types[0];

    const definedDefaults = defaults.filter(
        (d): d is string => d !== undefined
    );
    const finalDefaultValue =
        definedDefaults.length > 0 ? definedDefaults.join(":") : undefined;

    return { type, defaultValue: finalDefaultValue };
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

export const parseConditionalType = (
    typeStr: string
): ConditionalType | null => {
    console.log("Attempting to parse conditional:", typeStr);
    // Match format: [(1)=100?1:uint256]
    const match = typeStr.match(/^\[(.*?)\]$/);
    if (!match) return null;

    const inner = match[1];
    const parts = inner.match(/^\((\d+)\)(=|>=|<=|>|<|!=)(\w+)\?(\w+):(\w+)$/);
    if (!parts) return null;

    const [_, reference, operator, checkValue, trueTypeStr, falseTypeStr] =
        parts;
    console.log("Conditional parts:", {
        reference,
        operator,
        checkValue,
        trueTypeStr,
        falseTypeStr,
    });

    // Handle true type
    const trueType = isEvmType(trueTypeStr)
        ? (trueTypeStr as EvmType)
        : { constant: trueTypeStr };

    // Handle false type
    const falseType = isEvmType(falseTypeStr)
        ? (falseTypeStr as EvmType)
        : { constant: falseTypeStr };

    return {
        reference: Number(reference),
        operator: operator as ComparisonOperator,
        checkValue,
        trueType,
        falseType,
    };
};
