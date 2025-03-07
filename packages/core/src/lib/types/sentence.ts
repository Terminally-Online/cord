import { EvmType } from "./evm";

export type ConstantType = { constant: string };

// A simpler version of UnionType for use in CompoundType to avoid circular references
export type SimpleUnionType = {
	types: (EvmType | ConstantType)[];
};

export type CompoundType = {
	baseType: EvmType | ConstantType | SimpleUnionType;
	metadata: (EvmType | ConstantType | SimpleUnionType)[];
};

export type ComparisonOperator = "==" | ">" | "<" | ">=" | "<=" | "!=";
export type ComparisonValue = string | { reference: number; part?: number };
export type ComparisonType = {
	left: ComparisonValue;
	operator: ComparisonOperator;
	right: ComparisonValue;
	trueType: InputType;
	falseType: InputType;
};

export type UnionType = {
	types: InputType[];
};

export type InputType = EvmType | ConstantType | CompoundType | ComparisonType | UnionType;
export type InputReference = {
	index: number;
	name?: string;
	type?: InputType;
	defaultValue?: string;
	dependentOn?: number;
	delimiter?: string;
};

export type InputError = { type: "validation" | "resolution"; message: string };
export type InputState = {
	value: string;
	error?: InputError;
	isDisabled?: boolean;
};
export type InputValues = Map<number, InputState>;

export type ParsedCordSentence = {
	raw: string;
	template: string;
	inputs: InputReference[];
	values: Map<number, InputState>;
};

export type Result<T> =
	| { success: true; value: T }
	| { success: false; error: string };

export type SetValueResult = {
	success: true;
	value: InputValues;
	error?: string;
};
