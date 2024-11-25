import { InputValues, ParsedCordSentence, Result, SetValueResult } from "./lib";
import { compareValues } from "./parse";
import { validateCompoundValue, validateEvmValue } from "./validate";

export const setValue = <
	T extends {
		parsedSentence: ParsedCordSentence;
		currentValues: InputValues;
		index: number;
		value: string;
	},
>({
	parsedSentence,
	currentValues,
	index,
	value,
}: T): SetValueResult => {
const input = parsedSentence.inputs[index];
    if (!input?.type) {
        return { 
            success: true, 
            value: currentValues,
            error: "Invalid input" 
        };
    }

    let validationError: string | undefined;

    if (typeof input.type === "object" && "left" in input.type) {
        const conditionMet = compareValues(
            input.type.left,
            input.type.operator,
            input.type.right,
            currentValues
        );
        const activeType = conditionMet
            ? input.type.trueType
            : input.type.falseType;
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

    const currentValue = currentValues.get(index);
    if (currentValue === value) {
        return { 
            success: true, 
            value: currentValues,
            error: validationError 
        };
    }

    const newValues = new Map(currentValues);
    newValues.set(index, value);

    // Handle dependents
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
        error: validationError 
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
                if (typeof value === 'string') {
                    return value;
                }
                if ('value' in value) {
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
