import { describe, expect, it } from "vitest";
import {
    validateInputSequence,
    isComplete,
    validateEvmValue,
    isEvmType,
} from "./validate";
import type { InputReference, ParsedCordSentence, InputValues } from "./lib";

describe("validateInputSequence", () => {
    it("should validate correct sequential indices", () => {
        const inputs: InputReference[] = [
            { index: 0 },
            { index: 1 },
            { index: 2 },
        ];
        expect(validateInputSequence(inputs)).toBe(true);
    });

    it("should fail on missing indices", () => {
        const inputs: InputReference[] = [
            { index: 0 },
            { index: 2 }, // missing 1
            { index: 3 },
        ];
        expect(validateInputSequence(inputs)).toBe(false);
    });

    it("should fail on duplicate indices", () => {
        const inputs: InputReference[] = [
            { index: 0 },
            { index: 1 },
            { index: 1 }, // duplicate
        ];
        expect(validateInputSequence(inputs)).toBe(false);
    });

    it("should fail on out of order indices", () => {
        const inputs: InputReference[] = [
            { index: 1 },
            { index: 0 },
            { index: 2 },
        ];
        expect(validateInputSequence(inputs)).toBe(false);
    });

    it("should handle empty input array", () => {
        expect(validateInputSequence([])).toBe(true);
    });

    it("should handle single input", () => {
        expect(validateInputSequence([{ index: 0 }])).toBe(true);
    });
});

describe("isComplete", () => {
    const mockParsedSentence: ParsedCordSentence = {
        raw: "Transfer {0} {1} to {2}",
        template: "Transfer {0} {1} to {2}",
        inputs: [{ index: 0 }, { index: 1 }, { index: 2 }],
    };

    it("should return true when all inputs have values", () => {
        const values: InputValues = new Map([
            [0, "value0"],
            [1, "value1"],
            [2, "value2"],
        ]);
        expect(isComplete(mockParsedSentence, values)).toBe(true);
    });

    it("should return false when some inputs are missing values", () => {
        const values: InputValues = new Map([
            [0, "value0"],
            [2, "value2"],
            // missing value for index 1
        ]);
        expect(isComplete(mockParsedSentence, values)).toBe(false);
    });

    it("should return false when all inputs are missing values", () => {
        const values: InputValues = new Map();
        expect(isComplete(mockParsedSentence, values)).toBe(false);
    });

    it("should handle empty inputs array", () => {
        const emptyParsedSentence: ParsedCordSentence = {
            raw: "",
            template: "",
            inputs: [],
        };
        const values: InputValues = new Map();
        expect(isComplete(emptyParsedSentence, values)).toBe(true);
    });

    it("should ignore extra values not in inputs", () => {
        const values: InputValues = new Map([
            [0, "value0"],
            [1, "value1"],
            [2, "value2"],
            [3, "extra"], // extra value
        ]);
        expect(isComplete(mockParsedSentence, values)).toBe(true);
    });
});

describe("validateEvmValue", () => {
    describe("uint8", () => {
        it("should validate valid uint8 values", () => {
            expect(validateEvmValue("0", "uint8")).toBe(true);
            expect(validateEvmValue("255", "uint8")).toBe(true);
            expect(validateEvmValue("128", "uint8")).toBe(true);
        });

        it("should reject invalid uint8 values", () => {
            expect(validateEvmValue("256", "uint8")).toBe(false);
            expect(validateEvmValue("-1", "uint8")).toBe(false);
            expect(validateEvmValue("0x1", "uint8")).toBe(false);
        });
    });

    describe("uint16", () => {
        it("should validate valid uint16 values", () => {
            expect(validateEvmValue("0", "uint16")).toBe(true);
            expect(validateEvmValue("65535", "uint16")).toBe(true);
            expect(validateEvmValue("32768", "uint16")).toBe(true);
        });

        it("should reject invalid uint16 values", () => {
            expect(validateEvmValue("65536", "uint16")).toBe(false);
            expect(validateEvmValue("-1", "uint16")).toBe(false);
        });
    });

    describe("uint256", () => {
        it("should validate valid uint256 values", () => {
            expect(validateEvmValue("0", "uint256")).toBe(true);
            // Max uint256 value
            expect(
                validateEvmValue(
                    "115792089237316195423570985008687907853269984665640564039457584007913129639935",
                    "uint256"
                )
            ).toBe(true);
        });

        it("should reject invalid uint256 values", () => {
            expect(validateEvmValue("-1", "uint256")).toBe(false);
            // Value greater than max uint256
            expect(
                validateEvmValue(
                    "115792089237316195423570985008687907853269984665640564039457584007913129639936",
                    "uint256"
                )
            ).toBe(false);
        });
    });

    describe("address", () => {
        it("should validate valid addresses", () => {
            expect(
                validateEvmValue(
                    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    "address"
                )
            ).toBe(true);
            expect(
                validateEvmValue(
                    "0x0000000000000000000000000000000000000000",
                    "address"
                )
            ).toBe(true);
        });

        it("should reject invalid addresses", () => {
            expect(
                validateEvmValue(
                    "0x742d35Cc6634C0532925a3b844Bc454e4438f44",
                    "address"
                )
            ).toBe(false); // too short
            expect(
                validateEvmValue(
                    "742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    "address"
                )
            ).toBe(false); // no 0x
            expect(validateEvmValue("0xXYZ", "address")).toBe(false); // invalid chars
        });
    });
});

describe("isEvmType", () => {
    it("should validate uint types", () => {
        expect(isEvmType("uint8")).toBe(true);
        expect(isEvmType("uint16")).toBe(true);
        expect(isEvmType("uint256")).toBe(true);
    });

    it("should reject invalid uint types", () => {
        expect(isEvmType("uint0")).toBe(false);
        expect(isEvmType("uint7")).toBe(false);
        expect(isEvmType("uint257")).toBe(false);
        expect(isEvmType("uint")).toBe(false);
        expect(isEvmType("uint1")).toBe(false);
        expect(isEvmType("uint264")).toBe(false);
    });

    it("should validate other EVM types", () => {
        expect(isEvmType("address")).toBe(true);
        expect(isEvmType("bytes32")).toBe(true);
        expect(isEvmType("bool")).toBe(true);
    });
});
