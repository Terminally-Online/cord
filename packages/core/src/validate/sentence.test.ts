import { describe, expect, it } from "vitest";
import { validateInputSequence, isComplete } from "./sentence";
import type { InputReference, ParsedCordSentence, InputValues } from "../lib";

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
			{ index: 2 },
			{ index: 3 },
		];
		expect(validateInputSequence(inputs)).toBe(false);
	});

	it("should fail on duplicate indices", () => {
		const inputs: InputReference[] = [
			{ index: 0 },
			{ index: 1 },
			{ index: 1 },
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
		values: new Map(),
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
			values: new Map(),
		};
		const values: InputValues = new Map();
		expect(isComplete(emptyParsedSentence, values)).toBe(true);
	});

	it("should ignore extra values not in inputs", () => {
		const values: InputValues = new Map([
			[0, "value0"],
			[1, "value1"],
			[2, "value2"],
			[3, "extra"],
		]);
		expect(isComplete(mockParsedSentence, values)).toBe(true);
	});
});
