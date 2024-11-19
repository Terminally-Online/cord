import { describe, expect, it } from "vitest";
import { parseCordSentence } from "./parse";
import { resolveSentence, setValue } from "./values";

describe("Cord Parser", () => {
    describe("setValue", () => {
        it("should set and apply delimiters", () => {
            const sentence = parseCordSentence("Transfer {0} {1|:} to {2}");
            if (!sentence.success) throw new Error("Parse failed");

            const values = new Map();
            const result = setValue({
                parsedSentence: sentence.value,
                currentValues: values,
                index: 1,
                value: "ETH",
            });

            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(result.value.get(1)).toBe("ETH:");
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
