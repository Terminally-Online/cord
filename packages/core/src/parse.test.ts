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
    });
});
