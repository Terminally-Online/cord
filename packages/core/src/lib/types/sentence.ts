import { EvmType } from "./evm";

export type ConstantType = {
    constant: string;
};

export type CompoundType = {
    baseType: EvmType | ConstantType;
    metadata: (EvmType | ConstantType)[];
};

export type InputType = EvmType | ConstantType | CompoundType;

export type InputReference = {
    index: number;
    name?: string;
    type?: InputType;
    defaultValue?: string;
    dependentOn?: number;
    delimiter?: string;
};

export type ParsedCordSentence = {
    raw: string;
    template: string;
    inputs: InputReference[];
};

export type Result<T> =
    | { success: true; value: T }
    | { success: false; error: string };

export type InputValues = Map<number, string>;
