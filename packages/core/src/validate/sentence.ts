import { InputReference, InputValues, ParsedCordSentence } from "../lib";

export const isComplete = (
    parsedSentence: ParsedCordSentence,
    values: InputValues
): boolean => {
    return parsedSentence.inputs.every((input) => values.has(input.index));
};

export const validateInputSequence = (inputs: InputReference[]): boolean => {
    // NOTE: If we don't actually care about the order and only the inclusion of
    //       the indicies we could sort it before hand. Not sure of a reason one
    //       would actually want this as it requires more mental hurdling.
    // const indices = inputs.map((input) => input.index).sort((a, b) => a - b);
    return inputs.every((input, i) => input.index === i);
};
