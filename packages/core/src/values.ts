import { InputValues, ParsedCordSentence, Result } from "./lib";
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

  if (typeof input.type === "object" && "baseType" in input.type) {
    if (!validateCompoundValue(value, input.type)) {
      return { success: false, error: "Invalid compound value" };
    }
  } else if (!validateEvmValue(value, input.type)) {
    // For non-compound types (EvmType or ConstantType)
    return { success: false, error: "Invalid value" };
  }

  const currentValue = currentValues.get(index);
  if (currentValue === value) {
    return { success: true, value: currentValues };
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

  return { success: true, value: newValues };
};

export const resolveSentence = (
  parsedSentence: ParsedCordSentence,
  values: InputValues
): Result<string> => {
  try {
    const resolved = parsedSentence.template.replace(
      /\{(\d+)\}/g,
      (_, index) => values.get(Number(index)) || ""
    );

    return { success: true, value: resolved };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Resolution error",
    };
  }
};
