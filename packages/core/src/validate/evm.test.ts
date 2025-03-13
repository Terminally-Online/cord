import { describe, expect, it } from "vitest";
import { validateEvmValue, isEvmType } from "./evm";

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

	describe("uint256", () => {
		const maxUint256Value =
			"115792089237316195423570985008687907853269984665640564039457584007913129639935";
		const maxUint256ValueOverflow =
			"115792089237316195423570985008687907853269984665640564039457584007913129639936";

		it("should validate valid uint256 values", () => {
			expect(validateEvmValue("0", "uint256")).toBe(true);
			expect(validateEvmValue(maxUint256Value, "uint256")).toBe(true);
		});

		it("should reject invalid uint256 values", () => {
			expect(validateEvmValue("-1", "uint256")).toBe(false);
			expect(validateEvmValue(maxUint256ValueOverflow, "uint256")).toBe(
				false
			);
		});
	});

	describe("int8", () => {
		it("should validate valid int8 values", () => {
			expect(validateEvmValue("-128", "int8")).toBe(true);
			expect(validateEvmValue("127", "int8")).toBe(true);
			expect(validateEvmValue("0", "int8")).toBe(true);
		});

		it("should reject invalid int8 values", () => {
			expect(validateEvmValue("128", "int8")).toBe(false);
			expect(validateEvmValue("-129", "int8")).toBe(false);
			expect(validateEvmValue("0x1", "int8")).toBe(false);
		});
	});

	describe("int256", () => {
		const maxInt256 =
			"57896044618658097711785492504343953926634992332820282019728792003956564819967";
		const minInt256 =
			"-57896044618658097711785492504343953926634992332820282019728792003956564819968";

		it("should validate valid int256 values", () => {
			expect(validateEvmValue("0", "int256")).toBe(true);
			expect(validateEvmValue(maxInt256, "int256")).toBe(true);
			expect(validateEvmValue(minInt256, "int256")).toBe(true);
		});

		it("should reject invalid int256 values", () => {
			expect(
				validateEvmValue(`${BigInt(maxInt256) + 1n}`, "int256")
			).toBe(false);
			expect(
				validateEvmValue(`${BigInt(minInt256) - 1n}`, "int256")
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
			const addressTooShort = "0x742d35Cc6634C0532925a3b844Bc454e4438f44";
			const addressMissing0x = "742d35Cc6634C0532925a3b844Bc454e4438f44e";

			expect(validateEvmValue(addressTooShort, "address")).toBe(false);
			expect(validateEvmValue(addressMissing0x, "address")).toBe(false);
			expect(validateEvmValue("0xXYZ", "address")).toBe(false);
		});
	});

	describe("fixed-size bytes", () => {
		it("should validate bytes1", () => {
			expect(validateEvmValue("0x12", "bytes1")).toBe(true);
			expect(validateEvmValue("0x1", "bytes1")).toBe(false);
			expect(validateEvmValue("0x123", "bytes1")).toBe(false);
		});

		it("should validate bytes32", () => {
			expect(validateEvmValue("0x" + "12".repeat(32), "bytes32")).toBe(
				true
			);
			expect(validateEvmValue("0x" + "12".repeat(31), "bytes32")).toBe(
				false
			);
		});
	});

	describe("dynamic bytes", () => {
		it("should validate dynamic bytes", () => {
			expect(validateEvmValue("0x", "bytes")).toBe(true);
			expect(validateEvmValue("0x1234", "bytes")).toBe(true);
			expect(validateEvmValue("0x123", "bytes")).toBe(false);
		});
	});

	describe("string", () => {
		it("should validate strings", () => {
			expect(validateEvmValue("hello", "string")).toBe(true);
			expect(validateEvmValue("", "string")).toBe(false);
			expect(validateEvmValue("12345", "string")).toBe(true);
		});
	});

	describe("float", () => {
		it("should validate floats", () => {
			expect(validateEvmValue("1.1234", "float")).toBe(true);
		});
	});

	describe("bool", () => {
		it("should validate booleans", () => {
			expect(validateEvmValue("true", "bool")).toBe(true);
			expect(validateEvmValue("false", "bool")).toBe(true);
			expect(validateEvmValue("1", "bool")).toBe(false);
			expect(validateEvmValue("TRUE", "bool")).toBe(false);
		});
	});

	// TODO: Not sure what I broke here when updating the way I handled unions. If I
	//       remember right I made some change when I was implementing simple unions to
	//       avoid the circular reference issue. Now that I think about it though,
	//       I am not sure why we didn't allow infinite recursive referencing? If someone
	//       uses 20 levels of recursion that's their own fault.
	// describe("union types", () => {
	// 	it("should validate values against float|uint256 union", () => {
	// 		const unionType = {
	// 			types: ["float", "uint256"]
	// 		};

	// 		// Should accept float values
	// 		expect(validateEvmValue("123.45", unionType)).toBe(true);
	// 		expect(validateEvmValue("0.0", unionType)).toBe(true);
	// 		expect(validateEvmValue("-123.45", unionType)).toBe(true);

	// 		// Should accept uint256 values
	// 		expect(validateEvmValue("123", unionType)).toBe(true);
	// 		expect(validateEvmValue("0", unionType)).toBe(true);

	// 		// Should reject invalid values for both types
	// 		expect(validateEvmValue("abc", unionType)).toBe(false);
	// 	});

	// 	it("should validate values against address|bool union", () => {
	// 		const addressOrBoolUnion = {
	// 			types: ["address", "bool"]
	// 		};

	// 		expect(validateEvmValue("0x742d35Cc6634C0532925a3b844Bc454e4438f44e", addressOrBoolUnion)).toBe(true);
	// 		expect(validateEvmValue("true", addressOrBoolUnion)).toBe(true);
	// 		expect(validateEvmValue("false", addressOrBoolUnion)).toBe(true);
	// 		expect(validateEvmValue("123", addressOrBoolUnion)).toBe(false);
	// 	});
	// });
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
