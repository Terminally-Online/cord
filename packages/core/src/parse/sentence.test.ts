import { describe, expect, it } from "vitest";
import { parseCordSentence } from "./sentence";
import { setValue } from "../values";
import { ParsedCordSentence } from "../lib";

describe("parseCordSentence", () => {
	it("should parse basic placeholders", () => {
		const result = parseCordSentence("Transfer {0} {1} to {2}");
		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.value.inputs).toHaveLength(3);
		expect(result.value.inputs[0]).toEqual({ index: 0 });
	});

	it("should parse placeholders with name", () => {
		const result = parseCordSentence(
			"Transfer {0<amount>} {1<token>} to {2<recipient>}"
		);
		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.value.inputs).toHaveLength(3);
		expect(result.value.inputs[0]).toEqual({ index: 0, name: "amount" });
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

	it("should clear dependent values when parent value changes", () => {
		const mockParsedSentence: ParsedCordSentence = {
			raw: "Deposit {0<amount:uint256>} {1<token:address>} into {1=>2<vault:address>}",
			template: "Deposit {0} {1} into {2}",
			inputs: [
				{ index: 0, type: "uint256" },
				{ index: 1, type: "address" },
				{ index: 2, type: "address", dependentOn: 1 },
			],
			values: new Map(),
		};

		const currentValues = new Map([
			[1, { value: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" }],
			[2, { value: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" }],
		]);

		const result = setValue({
			parsedSentence: mockParsedSentence,
			currentValues,
			index: 1,
			value: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.get(1)?.value).toBe(
				"0x6B175474E89094C44Da98b954EedeAC495271d0F"
			);
			expect(result.value.has(2)).toBe(false);
		}
	});

	it("should clear dependent values when parent value is cleared", () => {
		const mockParsedSentence: ParsedCordSentence = {
			raw: "Deposit {0<amount:uint256>} {1<token:address>} into {1=>2<vault:address>}",
			template: "Deposit {0} {1} into {2}",
			inputs: [
				{ index: 0, type: "uint256" },
				{ index: 1, type: "address" },
				{ index: 2, type: "address", dependentOn: 1 },
			],
			values: new Map(),
		};

		const currentValues = new Map([
			[1, { value: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" }],
			[2, { value: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" }],
		]);

		const result = setValue({
			parsedSentence: mockParsedSentence,
			currentValues,
			index: 1,
			value: "",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.has(1)).toBe(false);
			expect(result.value.has(2)).toBe(false);
		}
	});
});

describe("parseCordSentence with default values", () => {
	it("should parse default values correctly", () => {
		const sentence = "Deposit {0<amount:uint256=1000>} {1<token:address>}";

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

describe("parseCordSentence with type unions", () => {
	it("should parse type unions correctly", () => {
		const sentence = "Transfer {0<amount:float|uint256>} {1<token:address>} to {2<recipient:address>}";

		const result = parseCordSentence(sentence);

		expect(result.success).toBe(true);
		if (!result.success) return;

		const input = result.value.inputs[0];
		expect(input.name).toBe("amount");
		expect(input.type).toHaveProperty("types");
		if (typeof input.type === "object" && "types" in input.type) {
			expect(input.type.types).toHaveLength(2);
			expect(input.type.types).toContain("float");
			expect(input.type.types).toContain("uint256");
		}
	});

	it("should parse type unions with default values", () => {
		const sentence = "Transfer {0<amount:float|uint256=1.5>} {1<token:address>} to {2<recipient:address>}";

		const result = parseCordSentence(sentence);

		expect(result.success).toBe(true);
		if (!result.success) return;

		const input = result.value.inputs[0];
		expect(input.defaultValue).toBe("1.5");
		expect(input.type).toHaveProperty("types");
	});

	it("should validate default values for type unions", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:float|uint256=abc>} {1<token:address>} to {2<recipient:address>}"
		);
		expect(result.success).toBe(false);
		if (result.success) return;
		
		expect(result.error).toContain("Invalid default value");
	});

	it("should validate default values work with any type in the union", () => {
		// Float value (valid for float but not for uint256)
		const floatResult = parseCordSentence(
			"Transfer {0<amount:float|uint256=1.5>} {1<token:address>} to {2<recipient:address>}"
		);
		expect(floatResult.success).toBe(true);

		// Integer value (valid for both float and uint256)
		const intResult = parseCordSentence(
			"Transfer {0<amount:float|uint256=100>} {1<token:address>} to {2<recipient:address>}"
		);
		expect(intResult.success).toBe(true);
		
		// Negative number (valid for float but not for uint256)
		const negativeResult = parseCordSentence(
			"Transfer {0<amount:float|uint256=-10.5>} {1<token:address>} to {2<recipient:address>}"
		);
		expect(negativeResult.success).toBe(true);
	});
});
