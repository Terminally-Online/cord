import { InputValues } from "./lib";

export const createInitialState = (): InputValues => new Map();

export const getInputValue = (
	values: InputValues,
	index: number,
): string | undefined => values.get(index)?.value;

export const hasValue = (values: InputValues, index: number): boolean =>
	values.has(index);

export const clearValue = (values: InputValues, index: number): InputValues => {
	const newValues = new Map(values);
	newValues.delete(index);
	return newValues;
};

export const clearAllValues = (): InputValues => new Map();
