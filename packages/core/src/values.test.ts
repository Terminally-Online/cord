import { describe, expect, it } from "vitest";
import { parseCordSentence } from "./parse";
import { resolveSentence, setValue } from "./values";
import { InputValues, ParsedCordSentence } from "./lib";

describe("Cord Parser", () => {
    describe("setValue", () => {
        const mockParsedSentence: ParsedCordSentence = {
            raw: "Transfer {0<amount:uint256>} {1<token:uint256:address>} to {2<recipient:address>}",
            template: "Transfer {0} {1} to {2}",
            inputs: [
                { index: 0, type: "uint256" },
                {
                    index: 1,
                    type: {
                        baseType: "uint256",
                        metadata: ["address"],
                    },
                },
                { index: 2, type: "address" },
            ],
        };

        it("should set valid uint256 value", () => {
            const currentValues: InputValues = new Map();
            const result = setValue({
                parsedSentence: mockParsedSentence,
                currentValues,
                index: 0,
                value: "1000000",
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.get(0)).toBe("1000000");
            }
        });

        it("should reject invalid uint256 value", () => {
            const currentValues: InputValues = new Map();
            const result = setValue({
                parsedSentence: mockParsedSentence,
                currentValues,
                index: 0,
                value: "not a number",
            });

            expect(result.success).toBe(false);
        });

        it("should set valid compound value", () => {
            const currentValues: InputValues = new Map();
            const result = setValue({
                parsedSentence: mockParsedSentence,
                currentValues,
                index: 1,
                value: "1:0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.get(1)).toBe(
                    "1:0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                );
            }
        });

        it("should reject invalid compound value", () => {
            const currentValues: InputValues = new Map();
            const result = setValue({
                parsedSentence: mockParsedSentence,
                currentValues,
                index: 1,
                value: "not:an:address",
            });

            expect(result.success).toBe(false);
        });

        it("should reject invalid index", () => {
            const currentValues: InputValues = new Map();
            const result = setValue({
                parsedSentence: mockParsedSentence,
                currentValues,
                index: 99,
                value: "1000000",
            });

            expect(result.success).toBe(false);
        });

        it("should preserve existing values when setting new value", () => {
            const currentValues: InputValues = new Map([[0, "1000000"]]);

            const result = setValue({
                parsedSentence: mockParsedSentence,
                currentValues,
                index: 1,
                value: "1:0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.get(0)).toBe("1000000");
                expect(result.value.get(1)).toBe(
                    "1:0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                );
            }
        });
    });

    describe("setValue with dependencies", () => {
        const mockParsedSentence: ParsedCordSentence = {
            raw: "Deposit {0<amount:uint256>} {1<token:address>} into {1=>2<vault:address>}",
            template: "Deposit {0} {1} into {2}",
            inputs: [
                { index: 0, type: "uint256" },
                { index: 1, type: "address" },
                { index: 2, type: "address", dependentOn: 1 },
            ],
        };

        it("should clear dependent values when parent value changes", () => {
            const currentValues = new Map([
                [1, "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"],
                [2, "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
            ]);

            const result = setValue({
                parsedSentence: mockParsedSentence,
                currentValues,
                index: 1,
                value: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.get(1)).toBe(
                    "0x6B175474E89094C44Da98b954EedeAC495271d0F"
                );
                expect(result.value.has(2)).toBe(false);
            }
        });

        it("should notclear dependent values when parent value remains the same", () => {
            const currentValues = new Map([
                [1, "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"],
                [2, "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
            ]);

            const result = setValue({
                parsedSentence: mockParsedSentence,
                currentValues,
                index: 1,
                value: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.get(1)).toBe(
                    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                );
                expect(result.value.has(2)).toBe(true);
            }
        });

        it("should not clear non-dependent values", () => {
            const currentValues = new Map([
                [0, "1000000"],
                [1, "0x123..."],
                [2, "0xabc..."],
            ]);

            const result = setValue({
                parsedSentence: mockParsedSentence,
                currentValues,
                index: 0,
                value: "2000000",
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.get(0)).toBe("2000000");
                expect(result.value.get(1)).toBe("0x123...");
                expect(result.value.get(2)).toBe("0xabc...");
            }
        });
    });

    describe("resolveSentence", () => {
        it("should resolve with provided values", () => {
            const sentence = parseCordSentence("Transfer {0} {1} to {2}");
            if (!sentence.success) throw new Error("Parse failed");

            const values = new Map([
                [0, "100"],
                [1, "ETH"],
                [2, "Bob"],
            ]);

            const result = resolveSentence(sentence.value, values);
            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(result.value).toBe("Transfer 100 ETH to Bob");
        });
    });
});
