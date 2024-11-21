import { describe, expect, it } from "vitest";
import { parseCordSentence } from "./sentence";
import { setValue } from "../values";

describe("parseCordSentence with compound types and defaults", () => {
    it("should parse compound types with mixed defaults", () => {
        const result = parseCordSentence(
            "Transfer {0<token:uint256=1:address:uint8=255>}"
        );

        expect(result.success).toBe(true);
        if (!result.success) return;

        const input = result.value.inputs[0];
        expect(input.type).toEqual({
            baseType: "uint256",
            metadata: ["address", "uint8"],
        });
        expect(input.defaultValue).toBe("1:255");
    });

    it("should handle compound types with no defaults", () => {
        const result = parseCordSentence(
            "Transfer {0<token:uint256:address:uint8>}"
        );

        expect(result.success).toBe(true);
        if (!result.success) return;

        const input = result.value.inputs[0];
        expect(input.type).toEqual({
            baseType: "uint256",
            metadata: ["address", "uint8"],
        });
        expect(input.defaultValue).toBeUndefined();
    });

    it("should handle compound types with all defaults", () => {
        const result = parseCordSentence(
            "Transfer {0<token:uint256=1:address=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48:uint8=255>}"
        );

        expect(result.success).toBe(true);
        if (!result.success) return;

        const input = result.value.inputs[0];
        expect(input.type).toEqual({
            baseType: "uint256",
            metadata: ["address", "uint8"],
        });
        expect(input.defaultValue).toBe(
            "1:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48:255"
        );
    });

    it("should handle compound types with mixed, non-sequential defaults", () => {
        const result = parseCordSentence(
            "Transfer {0<token:uint256=1:address:uint8=255>}"
        );

        expect(result.success).toBe(true);
        if (!result.success) return;

        const input = result.value.inputs[0];
        expect(input.type).toEqual({
            baseType: "uint256",
            metadata: ["address", "uint8"],
        });
        expect(input.defaultValue).toBe("1:255");
    });

    it("should validate each part of a compound type default", () => {
        const result = parseCordSentence(
            "Transfer {0<token:uint256=abc:address:uint8=999>}"
        );

        expect(result.success).toBe(false);
        // First default is invalid uint256
        if (result.success) return;
        expect(result.error).toContain(
            'Invalid default value "abc" for type uint256'
        );
    });

    it("should validate the last default in a compound type", () => {
        const result = parseCordSentence(
            "Transfer {0<token:uint256=1:address:uint8=999>}"
        );

        expect(result.success).toBe(false);
        // Last default is invalid uint8 (>255)
        if (result.success) return;
        expect(result.error).toContain(
            'Invalid default value "999" for type uint8'
        );
    });
});

describe("parseCordSentence with constant type validation", () => {
    it("should parse single constant type", () => {
        const result = parseCordSentence("Deposit {0<amount:1>}");

        expect(result.success).toBe(true);
        if (!result.success) return;

        const input = result.value.inputs[0];
        expect(input.type).toEqual({ constant: "1" });
    });

    it("should validate constant type values", () => {
        const sentence = parseCordSentence("Deposit {0<amount:1>}");
        expect(sentence.success).toBe(true);
        if (!sentence.success) return;

        const setValidResult = setValue({
            parsedSentence: sentence.value,
            currentValues: new Map(),
            index: 0,
            value: "1",
        });
        expect(setValidResult.success).toBe(true);

        const setInvalidResult = setValue({
            parsedSentence: sentence.value,
            currentValues: new Map(),
            index: 0,
            value: "2",
        });
        expect(setInvalidResult.success).toBe(false);
    });

    it("should parse constant type with default value", () => {
        const result = parseCordSentence("Deposit {0<amount:1=1>}");

        expect(result.success).toBe(true);
        if (!result.success) return;

        const input = result.value.inputs[0];
        expect(input.type).toEqual({ constant: "1" });
        expect(input.defaultValue).toBe("1");
    });

    it("should reject invalid default value for constant type", () => {
        const result = parseCordSentence("Deposit {0<amount:1=2>}");

        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.error).toContain(
            'Invalid default value "2" for constant(1)'
        );
    });

    describe("constant types in compound types", () => {
        it("should parse compound type with constant as base type", () => {
            const result = parseCordSentence("Transfer {0<token:1:address>}");

            expect(result.success).toBe(true);
            if (!result.success) return;

            const input = result.value.inputs[0];
            expect(input.type).toEqual({
                baseType: { constant: "1" },
                metadata: ["address"],
            });
        });

        it("should parse compound type with constant in metadata", () => {
            const result = parseCordSentence(
                "Transfer {0<token:uint256:1:address>}"
            );

            expect(result.success).toBe(true);
            if (!result.success) return;

            const input = result.value.inputs[0];
            expect(input.type).toEqual({
                baseType: "uint256",
                metadata: [{ constant: "1" }, "address"],
            });
        });

        it("should validate compound values with constants", () => {
            const sentence = parseCordSentence("Transfer {0<token:1:address>}");
            expect(sentence.success).toBe(true);
            if (!sentence.success) return;

            const setValidResult = setValue({
                parsedSentence: sentence.value,
                currentValues: new Map(),
                index: 0,
                value: "1:0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            });
            expect(setValidResult.success).toBe(true);

            const setInvalidResult = setValue({
                parsedSentence: sentence.value,
                currentValues: new Map(),
                index: 0,
                value: "2:0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            });
            expect(setInvalidResult.success).toBe(false);
        });

        it("should handle compound type with multiple constants", () => {
            const result = parseCordSentence("Transfer {0<token:1:2:3>}");

            expect(result.success).toBe(true);
            if (!result.success) return;

            const input = result.value.inputs[0];
            expect(input.type).toEqual({
                baseType: { constant: "1" },
                metadata: [{ constant: "2" }, { constant: "3" }],
            });
        });

        it("should handle mixed constants and EVM types with defaults", () => {
            const result = parseCordSentence(
                "Transfer {0<token:1=1:address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e:2=2>}"
            );

            expect(result.success).toBe(true);
            if (!result.success) return;

            const input = result.value.inputs[0];
            expect(input.type).toEqual({
                baseType: { constant: "1" },
                metadata: ["address", { constant: "2" }],
            });
            expect(input.defaultValue).toBe(
                "1:0x742d35Cc6634C0532925a3b844Bc454e4438f44e:2"
            );
        });
    });
});

describe("parseCordSentence with comparison based types", () => {
    describe("numeric comparisons", () => {
        const testCases = [
            {
                desc: "equal to",
                sentence:
                    "Transfer {0<amount:[(1)==100?1:uint256]>} {1<value:uint256>}",
                matchValue: "100",
                nonMatchValue: "99",
                expectedType: "1",
            },
            {
                desc: "greater than",
                sentence:
                    "Transfer {0<amount:[(1)>100?1:uint256]>} {1<value:uint256>}",
                matchValue: "101",
                nonMatchValue: "100",
                expectedType: "1",
            },
            {
                desc: "less than",
                sentence:
                    "Transfer {0<amount:[(1)<100?1:uint256]>} {1<value:uint256>}",
                matchValue: "99",
                nonMatchValue: "100",
                expectedType: "1",
            },
            {
                desc: "greater than or equal",
                sentence:
                    "Transfer {0<amount:[(1)>=100?1:uint256]>} {1<value:uint256>}",
                matchValue: "100",
                nonMatchValue: "99",
                expectedType: "1",
            },
            {
                desc: "less than or equal",
                sentence:
                    "Transfer {0<amount:[(1)<=100?1:uint256]>} {1<value:uint256>}",
                matchValue: "100",
                nonMatchValue: "101",
                expectedType: "1",
            },
            {
                desc: "not equal",
                sentence:
                    "Transfer {0<amount:[(1)!=100?1:uint256]>} {1<value:uint256>}",
                matchValue: "101",
                nonMatchValue: "100",
                expectedType: "1",
            },
        ];

        testCases.forEach(
            ({ desc, sentence, matchValue, nonMatchValue, expectedType }) => {
                describe(desc, () => {
                    it(`should validate when condition is met (${matchValue})`, () => {
                        const result = parseCordSentence(sentence);
                        expect(result.success).toBe(true);
                        if (!result.success) return;

                        // Set reference value
                        const withRef = setValue({
                            parsedSentence: result.value,
                            currentValues: new Map(),
                            index: 1,
                            value: matchValue,
                        });
                        expect(withRef.success).toBe(true);
                        if (!withRef.success) return;

                        // Should accept constant value when condition is met
                        const setResult = setValue({
                            parsedSentence: result.value,
                            currentValues: withRef.value,
                            index: 0,
                            value: expectedType,
                        });
                        expect(setResult.success).toBe(true);
                    });

                    it(`should validate against fallback type when condition is not met (${nonMatchValue})`, () => {
                        const result = parseCordSentence(sentence);
                        expect(result.success).toBe(true);
                        if (!result.success) return;

                        // Set reference value
                        const withRef = setValue({
                            parsedSentence: result.value,
                            currentValues: new Map(),
                            index: 1,
                            value: nonMatchValue,
                        });
                        expect(withRef.success).toBe(true);
                        if (!withRef.success) return;

                        // Should accept uint256 value when condition is not met
                        const setResult = setValue({
                            parsedSentence: result.value,
                            currentValues: withRef.value,
                            index: 0,
                            value: "123",
                        });
                        expect(setResult.success).toBe(true);
                    });
                });
            }
        );
    });

    describe("string comparisons", () => {
        it("should handle string equality", () => {
            const result = parseCordSentence(
                "Transfer {0<amount:[(1)==ERC721?1:uint256]>} {1<type:string>}"
            );
            expect(result.success).toBe(true);
            if (!result.success) return;

            const withRef = setValue({
                parsedSentence: result.value,
                currentValues: new Map(),
                index: 1,
                value: "ERC721",
            });
            expect(withRef.success).toBe(true);
            if (!withRef.success) return;

            const setResult = setValue({
                parsedSentence: result.value,
                currentValues: withRef.value,
                index: 0,
                value: "1",
            });
            expect(setResult.success).toBe(true);
        });
    });

    describe("conditional type validation with operators", () => {
        it("should handle basic numeric equality", () => {
            // First test the parsing
            const result = parseCordSentence(
                "Transfer {0<amount:[(1)==100?1:uint256]>} {1<value:uint256>}"
            );

            expect(result.success).toBe(true);
            if (!result.success) return;

            // Set reference value
            const withRef = setValue({
                parsedSentence: result.value,
                currentValues: new Map(),
                index: 1,
                value: "100",
            });

            expect(withRef.success).toBe(true);
            if (!withRef.success) return;

            // Try to set conditional value
            const setResult = setValue({
                parsedSentence: result.value,
                currentValues: withRef.value,
                index: 0,
                value: "1",
            });

            expect(setResult.success).toBe(true);
        });
    });
});
