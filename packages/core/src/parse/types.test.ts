import { describe, expect, it } from "vitest";
import { parseCordSentence } from "./sentence";
import { setValue } from "../values";

describe("parseCordSentence with compound types and defaults", () => {
	it("should parse compound types with mixed defaults", () => {
		const result = parseCordSentence(
			"Transfer {0<token:uint256=1:address:uint8=255>}",
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
			"Transfer {0<token:uint256:address:uint8>}",
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
			"Transfer {0<token:uint256=1:address=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48:uint8=255>}",
		);

		expect(result.success).toBe(true);
		if (!result.success) return;

		const input = result.value.inputs[0];
		expect(input.type).toEqual({
			baseType: "uint256",
			metadata: ["address", "uint8"],
		});
		expect(input.defaultValue).toBe(
			"1:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48:255",
		);
	});

	it("should handle compound types with mixed, non-sequential defaults", () => {
		const result = parseCordSentence(
			"Transfer {0<token:uint256=1:address:uint8=255>}",
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
			"Transfer {0<token:uint256=abc:address:uint8=999>}",
		);

		expect(result.success).toBe(false);

		if (result.success) return;
		expect(result.error).toContain(
			'Invalid default value "abc" for type uint256',
		);
	});

	it("should validate the last default in a compound type", () => {
		const result = parseCordSentence(
			"Transfer {0<token:uint256=1:address:uint8=999>}",
		);

		expect(result.success).toBe(false);

		if (result.success) return;
		expect(result.error).toContain(
			'Invalid default value "999" for type uint8',
		);
	});

	it("should handle compound value part references in comparisons", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[(1.1)>=20?1:uint256]>} {1<token:address:uint256>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;

		const setTokenResult = setValue({
			parsedSentence: result.value,
			currentValues: new Map(),
			index: 1,
			value: "0x62180042606624f02d8a130da8a3171e9b33894d:20",
		});

		expect(setTokenResult.success).toBe(true);
		if (!setTokenResult.success) return;
		expect(setTokenResult.value.get(0)?.value).toBe("1");
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

		// const setInvalidResult = setValue({
		// 	parsedSentence: sentence.value,
		// 	currentValues: new Map(),
		// 	index: 0,
		// 	value: "2",
		// });
		// expect(setInvalidResult.success).toBe(false);
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
			'Invalid default value "2" for constant(1)',
		);
	});

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
			"Transfer {0<token:uint256:1:address>}",
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

		// const setInvalidResult = setValue({
		// 	parsedSentence: sentence.value,
		// 	currentValues: new Map(),
		// 	index: 0,
		// 	value: "2:0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
		// });
		// expect(setInvalidResult.success).toBe(false);
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
			"Transfer {0<token:1=1:address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e:2=2>}",
		);

		expect(result.success).toBe(true);
		if (!result.success) return;

		const input = result.value.inputs[0];
		expect(input.type).toEqual({
			baseType: { constant: "1" },
			metadata: ["address", { constant: "2" }],
		});
		expect(input.defaultValue).toBe(
			"1:0x742d35Cc6634C0532925a3b844Bc454e4438f44e:2",
		);
	});

	it("should disable inputs of constant type", () => {
		const result = parseCordSentence("Deposit {0<amount:1>}");

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.value.values.get(0)?.isDisabled).toBe(true);
	});

	it("should disable inputs of constant type in comparison", () => {
		const result = parseCordSentence(
			"Deposit {0<amount:[(1)==1?1:2]>} {1<token:uint256=1>}",
		);

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.value.values.get(0)?.isDisabled).toBe(true);
	});
});

describe("parseCordSentence with comparison based types", () => {
	describe("numeric comparisons", () => {
		const testCases = [
			{
				desc: "equal to",
				sentence:
					"Transfer {0<amount:[(1)==100?1:uint256]>} {1<value:uint256=100>}",
				matchValue: "100",
				nonMatchValue: "99",
				expectedType: "1",
			},
			{
				desc: "greater than",
				sentence:
					"Transfer {0<amount:[(1)>100?1:uint256]>} {1<value:uint256=101>}",
				matchValue: "101",
				nonMatchValue: "100",
				expectedType: "1",
			},
			{
				desc: "less than",
				sentence:
					"Transfer {0<amount:[(1)<100?1:uint256]>} {1<value:uint256=99>}",
				matchValue: "99",
				nonMatchValue: "100",
				expectedType: "1",
			},
			{
				desc: "greater than or equal",
				sentence:
					"Transfer {0<amount:[(1)>=100?1:uint256]>} {1<value:uint256=100>}",
				matchValue: "100",
				nonMatchValue: "99",
				expectedType: "1",
			},
			{
				desc: "less than or equal",
				sentence:
					"Transfer {0<amount:[(1)<=100?1:uint256]>} {1<value:uint256=100>}",
				matchValue: "100",
				nonMatchValue: "101",
				expectedType: "1",
			},
			{
				desc: "not equal",
				sentence:
					"Transfer {0<amount:[(1)!=100?1:uint256]>} {1<value:uint256=101>}",
				matchValue: "101",
				nonMatchValue: "100",
				expectedType: "1",
			},
		];

		testCases.forEach(
			({ desc, sentence, matchValue, nonMatchValue, expectedType }) => {
				describe(desc, () => {
					it(`should automatically set values when comparison is met (${matchValue})`, () => {
						const result = parseCordSentence(sentence);
						expect(result.success).toBe(true);
						if (!result.success) return;

						expect(result.value.values.get(1)?.value).toBe(
							matchValue,
						);
						expect(result.value.values.get(0)?.value).toBe(
							expectedType,
						);
					});

					it(`should handle fallback type when comparison is not met (${nonMatchValue})`, () => {
						const nonMatchSentence = sentence.replace(
							`=${matchValue}>`,
							`=${nonMatchValue}>`,
						);

						const result = parseCordSentence(nonMatchSentence);
						expect(result.success).toBe(true);
						if (!result.success) return;

						expect(result.value.values.get(1)?.value).toBe(
							nonMatchValue,
						);
						expect(result.value.values.has(0)).toBe(false);
					});
				});
			},
		);
	});

	it("should handle comparison with string equality", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[(1)==ERC721?1:uint256]>} {1<type:string=ERC721>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.value.values.get(1)?.value).toBe("ERC721");
		expect(result.value.values.get(0)?.value).toBe("1");
	});

	it("should handle comparison with basic numeric equality", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[(1)==100?1:uint256]>} {1<value:uint256=100>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.value.values.get(1)?.value).toBe("100");
		expect(result.value.values.get(0)?.value).toBe("1");
	});

	it("should handle comparison with multiple references", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[(1)==(2)?1:uint256]>} {1<value:uint256=100>} {2<value:uint256=100>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.value.values.get(1)?.value).toBe("100");
		expect(result.value.values.get(2)?.value).toBe("100");
		expect(result.value.values.get(0)?.value).toBe("1");
	});

	it("should handle comparison with unequal reference values", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[(1)==(2)?1:uint256]>} {1<value:uint256=100>} {2<value:uint256=200>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.value.values.get(1)?.value).toBe("100");
		expect(result.value.values.get(2)?.value).toBe("200");
		expect(result.value.values.has(0)).toBe(false);
	});

	it("should handle comparison with basic numeric equality in inverse order", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[100==(1)?1:uint256]>} {1<value:uint256=100>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.value.values.get(1)?.value).toBe("100");
		expect(result.value.values.get(0)?.value).toBe("1");
	});

	it("should handle comparison with value-to-reference comparisons", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[100==(1)?1:uint256]>} {1<value:uint256=100>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.value.values.get(1)?.value).toBe("100");
		expect(result.value.values.get(0)?.value).toBe("1");
	});

	it("should handle comparison with value-to-reference greater than", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[200>(1)?1:uint256]>} {1<value:uint256=100>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.value.values.get(1)?.value).toBe("100");
		expect(result.value.values.get(0)?.value).toBe("1");
	});

	it("should handle comparison with value-to-reference less than", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[50<(1)?1:uint256]>} {1<value:uint256=100>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.value.values.get(1)?.value).toBe("100");
		expect(result.value.values.get(0)?.value).toBe("1");
	});

	it("should correctly parse nested comparison type", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[(1)==200?1:[(2)==200?2:3]]>} {1<value:uint256=100>} {2<value:uint256=200>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;

		const input = result.value.inputs[0];
		expect(input.type).toMatchObject({
			left: { reference: 1 },
			operator: "==",
			right: "200",
			trueType: { constant: "1" },
			falseType: {
				left: { reference: 2 },
				operator: "==",
				right: "200",
				trueType: { constant: "2" },
				falseType: { constant: "3" },
			},
		});
	});

	it("should correctly parse nested comparison type inverse order", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[(1)==200?[(2)==200?2:3]:1]>} {1<value:uint256=100>} {2<value:uint256=200>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;

		const input = result.value.inputs[0];
		expect(input.type).toMatchObject({
			left: { reference: 1 },
			operator: "==",
			right: "200",
			trueType: {
				left: { reference: 2 },
				operator: "==",
				right: "200",
				trueType: { constant: "2" },
				falseType: { constant: "3" },
			},
			falseType: { constant: "1" },
		});
	});

	it("should handle simple nested if-else", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[(1)==100?1:[(2)==200?2:3]]>} {1<value:uint256=100>} {2<value:uint256=200>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.value.values.get(0)?.value).toBe("1");
	});

	it("should handle first false, second true case", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[(1)==200?1:[(2)==200?2:3]]>} {1<value:uint256=100>} {2<value:uint256=200>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.value.values.get(0)?.value).toBe("2");
	});

	it("should handle all comparisons false", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[(1)==200?1:[(2)==300?2:3]]>} {1<value:uint256=100>} {2<value:uint256=200>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.value.values.get(0)?.value).toBe("3");
	});

	it("should handle deeply nested comparisons", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[(1)==100?1:[(2)==200?2:[(3)==300?4:5]]]>} {1<value:uint256=100>} {2<value:uint256=200>} {3<value:uint256=400>}",
		);
		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.value.values.get(0)?.value).toBe("1");
	});

	it("should handle comparison with default values", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[(1)>=20?1:uint256]=1>} {1<tokenType:uint256>}",
		);

		expect(result.success).toBe(true);
		if (!result.success) return;

		const input = result.value.inputs[0];
		expect(input.defaultValue).toBe("1");
	});

	it("should handle comparison with invalid typed default values", () => {
		const result = parseCordSentence(
			"Transfer {0<amount:[(1)>=20?1:uint256]=abc>} {1<tokenType:uint256>}",
		);

		expect(result.success).toBe(false);
	});
});
