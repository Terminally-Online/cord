import { isEvmType, validateEvmValue } from "../validate";
import { EvmType, CompoundType, ConstantType, InputType } from "../lib";

export const parseTypeString = (
    typeString: string
): {
    type: InputType;
    defaultValue?: string;
} => {
    const parts = typeString.split(":");
    const types: (EvmType | ConstantType)[] = [];
    const defaults: (string | undefined)[] = [];

    parts.forEach((part) => {
        const [typeStr, defaultValue] = part.split("=");

        const type: EvmType | ConstantType = isEvmType(typeStr)
            ? (typeStr as EvmType)
            : { constant: typeStr };

        if (defaultValue !== undefined) {
            if (!validateEvmValue(defaultValue, type)) {
                throw new Error(
                    typeof type === "object"
                        ? `Invalid default value "${defaultValue}" for constant(${type.constant})`
                        : `Invalid default value "${defaultValue}" for type ${type}`
                );
            }
        }

        types.push(type);
        defaults.push(defaultValue);
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
    const defaultValue =
        definedDefaults.length > 0 ? definedDefaults.join(":") : undefined;

    return { type, defaultValue };
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
