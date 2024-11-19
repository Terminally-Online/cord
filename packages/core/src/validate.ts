import { InputReference, InputValues, ParsedCordSentence } from "./lib";

export const validateInputSequence = (inputs: InputReference[]): boolean => {
    const indices = inputs.map((input) => input.index).sort((a, b) => a - b);
    return indices.every((idx, i) => idx === i);
};

export const isComplete = (
    parsedSentence: ParsedCordSentence,
    values: InputValues
): boolean => {
    return parsedSentence.inputs.every((input) => values.has(input.index));
};
