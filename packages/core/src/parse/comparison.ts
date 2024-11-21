import { ComparisonOperator, ComparisonValue, InputValues } from "../lib";

export const compareValues = (
    refValue: string,
    operator: ComparisonOperator,
    checkValue: ComparisonValue,
    values: InputValues
): boolean => {
    const compareToValue =
        typeof checkValue === "object"
            ? values.get(checkValue.reference)
            : checkValue.startsWith("(") && checkValue.endsWith(")")
            ? values.get(Number(checkValue.slice(1, -1)))
            : checkValue;

    if (compareToValue === undefined) {
        return false;
    }

    const num1 = Number(refValue);
    const num2 = Number(compareToValue);

    if (!isNaN(num1) && !isNaN(num2)) {
        switch (operator) {
            case "==":
                return num1 === num2;
            case ">":
                return num1 > num2;
            case "<":
                return num1 < num2;
            case ">=":
                return num1 >= num2;
            case "<=":
                return num1 <= num2;
            case "!=":
                return num1 !== num2;
        }
    }

    switch (operator) {
        case "==":
            return refValue === compareToValue;
        case ">":
            return refValue > compareToValue;
        case "<":
            return refValue < compareToValue;
        case ">=":
            return refValue >= compareToValue;
        case "<=":
            return refValue <= compareToValue;
        case "!=":
            return refValue !== compareToValue;
    }
};
