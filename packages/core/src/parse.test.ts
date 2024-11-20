import { describe, expect, it } from "vitest";
import { parseCordSentence } from "./parse";
import { setValue } from "./values";

describe("Cord Parser", () => {
    describe("parseCordSentence", () => {
        it("should parse basic placeholders", () => {
            const result = parseCordSentence("Transfer {0} {1} to {2}");
            expect(result.success).toBe(true);
            if (!result.success) return;

            expect(result.value.inputs).toHaveLength(3);
            expect(result.value.inputs[0]).toEqual({ index: 0 });
        });

        it("should parse named inputs", () => {
            const result = parseCordSentence(
                "Transfer {0<amount>} {1<token>} to {2}"
            );
            expect(result.success).toBe(true);
            if (!result.success) return;

            expect(result.value.inputs[0]).toEqual({
                index: 0,
                name: "amount",
            });
        });

        it("should parse a single dependency", () => {
            const result = parseCordSentence("Test {0} and {0=>1}");

            expect(result.success).toBe(true);
            if (!result.success) return;

            const inputs = result.value.inputs;
            expect(inputs[1].dependentOn).toBe(0);
        });

        it("should correctly parse dependencies", () => {
            const result = parseCordSentence(
                "Deposit {0<amount:uint256>} {1<token:address>} into {1=>2<vault:address>}"
            );

            expect(result.success).toBe(true);
            if (!result.success) return;

            const inputs = result.value.inputs;
            expect(inputs[2].dependentOn).toBe(1);
            expect(inputs[2].index).toBe(2);
            expect(inputs[2].type).toBe("address");
        });

        it("should parse multiple dependencies", () => {
            const result = parseCordSentence(
                "Transfer {0} {1} to {1=>2} and {1=>3}"
            );

            expect(result.success).toBe(true);
            if (!result.success) return;

            expect(result.value.inputs[2].dependentOn).toBe(1);
            expect(result.value.inputs[3].dependentOn).toBe(1);
        });
    });

    describe("parseCordSentence with default values", () => {
        it("should parse default values correctly", () => {
            const sentence =
                "Deposit {0<amount:uint256=1000>} {1<token:address>}";

            const result = parseCordSentence(sentence);

            expect(result.success).toBe(true);
            if (!result.success) return;

            const input = result.value.inputs[0];
            expect(input.defaultValue).toBe("1000");
            expect(input.type).toBe("uint256");
        });

        it("should validate default values match their types", () => {
            const result = parseCordSentence(
                "Deposit {0<amount:uint256=invalid>} {1<token:address>}"
            );
            expect(result.success).toBe(false);
        });

        it("should handle multiple inputs with default values", () => {
            const result = parseCordSentence(
                "Transfer {0<amount:uint256=100>} {1<token:address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e>}"
            );

            expect(result.success).toBe(true);
            if (!result.success) return;

            expect(result.value.inputs[0].defaultValue).toBe("100");
            expect(result.value.inputs[1].defaultValue).toBe(
                "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
            );
        });
    });

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
                const result = parseCordSentence(
                    "Transfer {0<token:1:address>}"
                );

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
                const sentence = parseCordSentence(
                    "Transfer {0<token:1:address>}"
                );
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
});
