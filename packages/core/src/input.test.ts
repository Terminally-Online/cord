import { describe, expect, it } from "vitest";
import { isConstantType, shouldRenderInput } from "./input";

describe("isConstantType", () => {
	it("should identify constant types", () => {
		const result = isConstantType({ constant: "1" });
		expect(result.isConstant).toBe(true);
		expect(result.value).toBe("1");
	});

	it("should handle non-constant types", () => {
		expect(isConstantType("uint256").isConstant).toBe(false);
		expect(isConstantType(undefined).isConstant).toBe(false);
	});
});

describe("shouldRenderInput", () => {
	it("should handle null types", () => {
		expect(shouldRenderInput("null", [], () => undefined)).toBe(false);
	});

	it("should handle undefined types", () => {
		expect(shouldRenderInput(undefined, [], () => undefined)).toBe(true);
	});

	it("should handle basic types", () => {
		expect(shouldRenderInput("uint256", [], () => undefined)).toBe(true);
	});
});
