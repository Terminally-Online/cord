import {
	InputReference,
	InputState,
	InputValues,
	ParsedCordSentence,
} from "./sentence";

export type ValidationError = {
	type: "validation";
	message: string;
};

export type CordError = {
	type: "parse" | "resolution" | "validation";
	message: string;
};

export type CordState = {
	values: InputValues;
	parsed: ParsedCordSentence | null;
	resolvedSentence: string | null;
	error: CordError | null;
	isDirty: boolean;
	validationErrors: Map<number, ValidationError>;
};

export type UseCordReturn = {
	state: CordState;
	actions: {
		setValue: (index: number, value: string) => void;
		reset: () => void;
		clear: (index: number) => void;
		clearAll: () => void;
	};
	helpers: {
		getInputValue: (index: number) => InputState | undefined;
		getInputError: (index: number) => ValidationError | undefined;
		getDependentInputs: (index: number) => InputReference[];
		hasDependency: (index: number) => boolean;
		isComplete: boolean;
		isValid: boolean;
	};
};
