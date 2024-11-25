import { useState, useCallback, useMemo } from "react";
import { parseCordSentence } from "../parse";
import { setValue, resolveSentence } from "../values";
import { createInitialState } from "../state";
import { ParsedCordSentence, InputValues, InputReference } from "../lib";

export type ValidationError = {
	type: "validation";
	message: string;
};

export type CordError = {
	type: "parse" | "resolution" | "validation";
	message: string;
};

interface UseCordState {
	values: InputValues;
	parsed: ParsedCordSentence | null;
	resolvedSentence: string | null;
	error: CordError | null;
	isDirty: boolean;
	validationErrors: Map<number, ValidationError>;
}

interface UseCordActions {
	setValue: (index: number, value: string) => void;
	reset: () => void;
	clear: (index: number) => void;
	clearAll: () => void;
}

interface UseCordHelpers {
	getInputValue: (index: number) => string | undefined;
	getInputError: (index: number) => ValidationError | undefined;
	getDependentInputs: (index: number) => InputReference[];
	hasDependency: (index: number) => boolean;
	isComplete: boolean;
	isValid: boolean;
}

interface UseCordReturn {
	state: UseCordState;
	actions: UseCordActions;
	helpers: UseCordHelpers;
}

export const useCord = (sentence: string): UseCordReturn => {
	const [values, setValues] = useState<InputValues>(createInitialState());
	const [error, setError] = useState<CordError | null>(null);
	const [validationErrors, setValidationErrors] = useState<
		Map<number, ValidationError>
	>(new Map());
	const [isDirty, setIsDirty] = useState(false);

	const parsed = useMemo(() => {
		const result = parseCordSentence(sentence);
		if (!result.success) {
			setError({
				type: "parse",
				message: result.error,
			});
			return null;
		}
		setError(null);
		return result.value;
	}, [sentence]);

	const resolvedSentence = useMemo(() => {
		if (!parsed) return null;

		// Only try to resolve if we have all values (even if invalid)
		const allInputsHaveValues = parsed.inputs.every((input) =>
			values.has(input.index),
		);
		if (!allInputsHaveValues) return null;

		const result = resolveSentence(parsed, values);
		if (!result.success) {
			setError({
				type: "resolution",
				message: result.error,
			});
			return null;
		}
		return result.value;
	}, [parsed, values]);

	const actions: UseCordActions = {
		setValue: useCallback(
			(index: number, value: string) => {
				if (!parsed) return;

				const result = setValue({
					parsedSentence: parsed,
					currentValues: values,
					index,
					value,
				});

				setValues(result.value);
				setIsDirty(true);

				if (result.error) {
					setValidationErrors((current) => {
						const newErrors = new Map(current);
						newErrors.set(index, {
							type: "validation",
							message: result.error!,
						});
						return newErrors;
					});
				} else {
					setValidationErrors((current) => {
						const newErrors = new Map(current);
						newErrors.delete(index);
						return newErrors;
					});
				}
			},
			[parsed, values],
		),

		reset: useCallback(() => {
			setValues(createInitialState());
			setValidationErrors(new Map());
			setError(null);
			setIsDirty(false);
		}, []),

		clear: useCallback((index: number) => {
			setValues((values) => {
				const newValues = new Map(values);
				newValues.delete(index);
				return newValues;
			});
			setValidationErrors((errors) => {
				const newErrors = new Map(errors);
				newErrors.delete(index);
				return newErrors;
			});
			setIsDirty(true);
		}, []),

		clearAll: useCallback(() => {
			setValues(createInitialState());
			setValidationErrors(new Map());
			setIsDirty(true);
		}, []),
	};

	const helpers: UseCordHelpers = {
		getInputValue: useCallback(
			(index: number) => values.get(index)?.value,
			[values],
		),

		getInputError: useCallback(
			(index: number) => validationErrors.get(index),
			[validationErrors],
		),

		getDependentInputs: useCallback(
			(index: number) => {
				if (!parsed) return [];
				return parsed.inputs.filter(
					(input) => input.dependentOn === index,
				);
			},
			[parsed],
		),

		hasDependency: useCallback(
			(index: number) => {
				if (!parsed) return false;
				return parsed.inputs.some(
					(input) => input.dependentOn === index,
				);
			},
			[parsed],
		),

		isComplete: useMemo(() => {
			if (!parsed) return false;
			return parsed.inputs.every((input) => values.has(input.index));
		}, [parsed, values]),

		isValid: useMemo(() => {
			return validationErrors.size === 0;
		}, [validationErrors]),
	};

	return {
		state: {
			values,
			parsed,
			resolvedSentence,
			error,
			isDirty,
			validationErrors,
		},
		actions,
		helpers,
	};
};
