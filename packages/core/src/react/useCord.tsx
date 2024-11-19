import { useState, useCallback, useMemo } from "react";
import { parseCordSentence } from "../parse";
import { setValue, resolveSentence } from "../values";
import { createInitialState } from "../state";
import { ParsedCordSentence, InputValues, InputReference } from "../lib";

type CordError = {
    type: "parse" | "validation" | "resolution";
    message: string;
};

interface UseCordState {
    values: InputValues;
    parsed: ParsedCordSentence | null;
    resolvedSentence: string | null;
    error: CordError | null;
    isDirty: boolean;
}

interface UseCordActions {
    setValue: (index: number, value: string) => void;
    reset: () => void;
    clear: (index: number) => void;
    clearAll: () => void;
}

interface UseCordHelpers {
    getInputValue: (index: number) => string | undefined;
    getDependentInputs: (index: number) => InputReference[];
    hasDependency: (index: number) => boolean;
    isComplete: boolean;
}

interface UseCordReturn {
    state: UseCordState;
    actions: UseCordActions;
    helpers: UseCordHelpers;
}

export const useCord = (sentence: string): UseCordReturn => {
    const [values, setValues] = useState<InputValues>(createInitialState());
    const [error, setError] = useState<CordError | null>(null);
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

        const result = resolveSentence(parsed, values);
        // Only set error if there's an actual resolution error,
        // not just missing values
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

                if (result.success) {
                    setValues(result.value);
                    setIsDirty(true);
                    setError(null);
                } else {
                    setError({
                        type: "validation",
                        message: result.error,
                    });
                }
            },
            [parsed, values]
        ),

        reset: useCallback(() => {
            setValues(createInitialState());
            setError(null);
            setIsDirty(false);
        }, []),

        clear: useCallback((index: number) => {
            setValues((values) => {
                const newValues = new Map(values);
                newValues.delete(index);
                return newValues;
            });
            setIsDirty(true);
        }, []),

        clearAll: useCallback(() => {
            setValues(createInitialState());
            setIsDirty(true);
        }, []),
    };

    const helpers: UseCordHelpers = {
        getInputValue: useCallback(
            (index: number) => values.get(index),
            [values]
        ),

        getDependentInputs: useCallback(
            (index: number) => {
                if (!parsed) return [];
                return parsed.inputs.filter(
                    (input) => input.dependentOn === index
                );
            },
            [parsed]
        ),

        hasDependency: useCallback(
            (index: number) => {
                if (!parsed) return false;
                return parsed.inputs.some(
                    (input) => input.dependentOn === index
                );
            },
            [parsed]
        ),

        isComplete: useMemo(() => {
            if (!parsed) return false;
            return parsed.inputs.every((input) => values.has(input.index));
        }, [parsed, values]),
    };

    return {
        state: {
            values,
            parsed,
            resolvedSentence,
            error,
            isDirty,
        },
        actions,
        helpers,
    };
};
