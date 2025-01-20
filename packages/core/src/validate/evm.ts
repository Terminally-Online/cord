import { CompoundType, EvmType, InputType } from "@/lib";

const UINT_PATTERN = /^uint(\d+)$/;
const INT_PATTERN = /^int(\d+)$/;
const BYTES_PATTERN = /^bytes(\d+)$/;

const maxUintValue = (bits: number): bigint => 2n ** BigInt(bits) - 1n;
const maxIntValue = (bits: number): bigint => 2n ** BigInt(bits - 1) - 1n;
const minIntValue = (bits: number): bigint => -(2n ** BigInt(bits - 1));

export const validateEvmValue = (value: string, type: InputType): boolean => {
	if (!value.trim()) {
		return false;
	}

	if (type === "null") {
		return true;
	}

	if (type === "float") {
		try {
			const floatValue = parseFloat(value);
			return !isNaN(floatValue);
		} catch {
			return false;
		}
	}

	if (typeof type === "object" && "left" in type) {
		return true;
	}

	if (typeof type === "object" && "constant" in type) {
		return value === type.constant;
	}

	if (typeof type === "object" && "baseType" in type) {
		const parts = value.split(":");
		if (parts.length !== type.metadata.length + 1) return false;
		const [baseValue, ...metadataValues] = parts;
		if (!validateEvmValue(baseValue, type.baseType)) return false;
		return metadataValues.every((value, index) =>
			validateEvmValue(value, type.metadata[index])
		);
	}

	if (type.startsWith("uint") || type.startsWith("int")) {
		if (value.startsWith("0x")) return false;

		try {
			const numValue = BigInt(value);
			const bitSize =
				parseInt(type.slice(type.startsWith("uint") ? 4 : 3)) || 256;
			const maxValue = type.startsWith("uint")
				? 2n ** BigInt(bitSize) - 1n
				: 2n ** BigInt(bitSize - 1) - 1n;
			const minValue = type.startsWith("uint")
				? 0n
				: -(2n ** BigInt(bitSize - 1));

			return numValue >= minValue && numValue <= maxValue;
		} catch {
			return false;
		}
	}

	const bytesMatch = type.match(BYTES_PATTERN);
	if (bytesMatch) {
		const size = parseInt(bytesMatch[1]);
		return new RegExp(`^0x[a-fA-F0-9]{${size * 2}}$`).test(value);
	}

	switch (type) {
		case "address":
			return /^0x[a-fA-F0-9]{40}$/.test(value);
		case "bool":
			return value === "true" || value === "false";
		case "string":
			return true;
		case "bytes":
			return /^0x([a-fA-F0-9]{2})*$/.test(value);
		default:
			return false;
	}
};

export const validateCompoundValue = (
	value: string,
	type: CompoundType
): boolean => {
	const parts = value.split(":");
	if (parts.length !== type.metadata.length + 1) return false;

	const [baseValue, ...metadataValues] = parts;
	if (!validateEvmValue(baseValue, type.baseType)) return false;

	return metadataValues.every((value, index) =>
		validateEvmValue(value, type.metadata[index])
	);
};

export const isEvmType = (type: string): type is EvmType => {
	if (type === "null") return true;

	if (type.startsWith("uint")) {
		const match = type.match(UINT_PATTERN);
		if (!match) return false;
		const bits = parseInt(match[1]);
		return bits >= 8 && bits <= 256 && bits % 8 === 0;
	}

	if (type.startsWith("int")) {
		const match = type.match(INT_PATTERN);
		if (!match) return false;
		const bits = parseInt(match[1]);
		return bits >= 8 && bits <= 256 && bits % 8 === 0;
	}

	if (type.startsWith("bytes")) {
		const match = type.match(BYTES_PATTERN);
		if (!match) return false;
		const size = parseInt(match[1]);
		return size >= 1 && size <= 32;
	}

	return ["address", "bool", "string", "bytes", "float"].includes(type);
};
