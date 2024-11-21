import { ComparisonOperator } from "../lib";

export const compareValues = (
    value: string,
    operator: ComparisonOperator,
    checkValue: string
): boolean => {
    const num1 = Number(value);
    const num2 = Number(checkValue);

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
            return value === checkValue;
        case ">":
            return value > checkValue;
        case "<":
            return value < checkValue;
        case ">=":
            return value >= checkValue;
        case "<=":
            return value <= checkValue;
        case "!=":
            return value !== checkValue;
    }
};
