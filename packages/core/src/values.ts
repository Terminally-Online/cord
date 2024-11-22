import { InputValues, ParsedCordSentence, Result } from "./lib";
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
}: T): Result<InputValues> => {
  const input = parsedSentence.inputs[index];
  if (!input?.type) return { success: false, error: "Invalid input" };

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
      return { success: false, error: "Invalid value for conditional type" };
    }
  }

  if (typeof input.type === "object" && "baseType" in input.type) {
    if (!validateCompoundValue(value, input.type)) {
      return { success: false, error: "Invalid compound value" };
    }
  } else if (!validateEvmValue(value, input.type)) {
    return { success: false, error: "Invalid value" };
  }

  const currentValue = currentValues.get(index);
  if (currentValue === value) {
    return { success: true, value: currentValues };
  }

  const newValues = new Map(currentValues);
  newValues.set(index, value);

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

  return { success: true, value: newValues };
};

export const resolveSentence = (
  parsedSentence: ParsedCordSentence,
  values?: InputValues
): Result<string> => {
  try {
    const resolveValues = values || parsedSentence.values;

    const resolved = parsedSentence.template.replace(
      /\{(\d+)\}/g,
      (_, index) => {
        const value = resolveValues.get(Number(index));
        if (value === undefined) {
          throw new Error(`Missing value for input ${index}`);
        }
        return value;
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
