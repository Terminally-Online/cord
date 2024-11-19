import { EvmType } from "./evm";
import { CompoundType } from "./metadata";

export type InputReference = {
    index: number;
    name?: string;
    type?: EvmType | CompoundType;
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
