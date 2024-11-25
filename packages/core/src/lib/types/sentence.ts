import { EvmType } from "./evm";

export type ConstantType = {
	constant: string;
};

export type CompoundType = {
	baseType: EvmType | ConstantType;
	metadata: (EvmType | ConstantType)[];
};

export type ComparisonOperator = "==" | ">" | "<" | ">=" | "<=" | "!=";

export type ComparisonValue = string | { reference: number };

export type ConditionalType = {
	left: ComparisonValue;
	operator: ComparisonOperator;
	right: ComparisonValue;
	trueType: InputType;
	falseType: InputType;
};

export type InputType = EvmType | ConstantType | CompoundType | ConditionalType;

export type InputReference = {
	index: number;
	name?: string;
	type?: InputType;
	defaultValue?: string;
	dependentOn?: number;
	delimiter?: string;
};

export type InputError = {
	type: "validation" | "resolution";
	message: string;
};

export type InputState = {
	value: string;
	error?: InputError;
};

export type ParsedCordSentence = {
	raw: string;
	template: string;
	inputs: InputReference[];
	values: Map<number, InputState>;
};

export type Result<T> =
	| { success: true; value: T }
	| { success: false; error: string };

export type InputValues = Map<number, string>;

export type SetValueResult = {
	success: true;
	value: InputValues;
	error?: string;
};
