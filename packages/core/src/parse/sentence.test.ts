import { describe, expect, it } from "vitest";
import { parseCordSentence } from "./sentence";

describe("parseCordSentence", () => {
	it("should parse basic placeholders", () => {
		const result = parseCordSentence("Transfer {0} {1} to {2}");
		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.value.inputs).toHaveLength(3);
		expect(result.value.inputs[0]).toEqual({ index: 0 });
	});

	// TODO: (#16): This will fail because it does not have an associated type.
	it("should parse placeholders with name", () => {
		const result = parseCordSentence(
			"Transfer {0<amount>} {1<token>} to {2<recipient>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.value.inputs).toHaveLength(3);
		expect(result.value.inputs[0]).toEqual({ index: 0, name: "amount" });
	});

	it("should parse named inputs", () => {
		const result = parseCordSentence(
			"Transfer {0<amount>} {1<token>} to {2}",
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
			"Deposit {0<amount:uint256>} {1<token:address>} into {1=>2<vault:address>}",
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
			"Transfer {0} {1} to {1=>2} and {1=>3}",
		);

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.value.inputs[2].dependentOn).toBe(1);
		expect(result.value.inputs[3].dependentOn).toBe(1);
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
			"Deposit {0<amount:uint256=invalid>} {1<token:address>}",
		);
		expect(result.success).toBe(false);
	});

	it("should handle multiple inputs with default values", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:uint256=100>} {1<token:address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e>}",
		);

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.value.inputs[0].defaultValue).toBe("100");
		expect(result.value.inputs[1].defaultValue).toBe(
			"0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
		);
	});
});
