import { InputReference, InputValues, ParsedCordSentence, Result } from "./lib";

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
    const input = parsedSentence.inputs.find((i) => i.index === index);

    if (!input) {
        return {
            success: false,
            error: `Invalid input index: ${index}`,
        };
    }

    const newValues = new Map(currentValues);
    newValues.set(
        index,
        input.delimiter ? `${value}${input.delimiter}` : value
    );

    return { success: true, value: newValues };
};

export const getDependencies = (
    parsedSentence: ParsedCordSentence,
    index: number
): number[] => {
    return parsedSentence.inputs
        .filter(
            (input) => input.dependentOn !== undefined && input.index === index
        )
        .map((input) => input.dependentOn!)
        .filter(Boolean);
};

export const getDependentInputs = (
    parsedSentence: ParsedCordSentence,
    index: number
): InputReference[] => {
    return parsedSentence.inputs.filter((input) => input.dependentOn === index);
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
