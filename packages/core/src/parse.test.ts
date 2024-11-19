import { describe, expect, it } from "vitest";
import { parseCordSentence } from "./parse";

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
});
