![Cord image](./cord.png)

# Cord

Cord is a templating language designed to create structured, type-safe input forms from simple strings. It helps developers build user interfaces for blockchain transactions by combining human-readable sentences with powerful validation rules.

For example, this Cord string:

```typescript
Send {0<amount:uint256>} {1<token:address>} to {2<recipient:address>}"
```

Automatically creates an interface that:

-   Validates the amount is a valid uint256 number
-   Ensures the token is a valid Ethereum address
-   Verifies the recipient is a valid Ethereum address
-   Maintains the natural sentence structure for users

Cord bridges the gap between human-readable instructions and blockchain-ready data, making it easier to build reliable DApp interfaces without complex forms or even form validation code.

## Inspiration

Cord's syntax is inspired by Python's f-strings (formatted string literals), which use curly braces for variable interpolation. However, Cord extends this concept with additional features for type safety, validation, and dependencies:

```python
# Python f-string
name = "Alice"
amount = 100
f"Send {amount} tokens to {name}"
```

```typescript
// Cord equivalent with types and validation
"Send {0<amount:uint256>} tokens to {1<recipient:address>}";
```

## Validation Rules

1. Input indices must be sequential starting from 0
2. Default values must match their specified types
3. Constant types enforce exact value matches
4. Compound types validate each part independently
5. Dependencies are cleared when parent values change
6. Comparison types dynamically validate based on conditions

## Error Handling

The parser provides detailed error messages for:

-   Invalid type definitions
-   Incorrect default values
-   Malformed comparison expressions
-   Missing required values
-   Type validation failures

## Core Syntax

Input placeholders are denoted by curly braces containing an index number, starting from `0`:

```typescript
{0}, {1}, {2}, etc.
```

## Usage Patterns

### Raw Substitution

For independent inputs that don't share data relationships, use simple indexed placeholders:

```typescript
Deposit {0} {1} into {2}.
```

### Names

Add semantic meaning to inputs by providing names:

```typescript
Transfer {0<amount>} {1<token>} {2<id>} to {3<recipient>}.
```

### Default Values

Specify default values by appending `={value}` after the type definition:

```typescript
Deposit {0<amount:uint256=1>} {1<token:address=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48:uint8=20>} into {1=>2<vault:address>}.
```

### Types and Validation

You can define a single-depth EVM type to enable native validation on named inputs. If not provided, inputs will not be validated.

```typescript
Transfer {0<amount:uint256>} {1<token:address>} {2<id:uint256>} to {3<recipient:address>}.
```

Valid types include:

-   `uint[8-256]`
-   `int[8-256]`
-   `bytes[1-32]`
-   `bytes`
-   `address`
-   `bool`
-   `string`

### Compound Types

For cases requiring multiple type validations, use compound types separated by colons:

```typescript
Transfer {0<amount:uint256>} {1<token:address:uint8>} {2<id:uint256>} to {3<recipient:address>}.
```

This allows validation of multiple parts of a single input. For example, validating both a token address and its decimals:

### Constant Value Types

To restrict an input to a specific value, use a constant type:

```typescript
Deposit {0<amount:1>} {1<token:address>}
```

### Comparison Types

Enable dynamic type selection based on conditions using comparison types:

```typescript
// Basic comparison of two reference values.
Transfer {0<amount:[(1)>=20?1:uint256]>} {1<tokenType:uint256>}
// Reference compare two reference values (whether whole or parts) by wrapping an index in parentheses.
Transfer {0<amount:[(1)==(2)?1:uint256]>} {1<value:uint256=100>} {2<amount:uint256=100>}
// Index part references with (index.part) notation.
Transfer {0<amount:[(1.1)==721?1:uint256]>} {1<token:address:uint256>}
// Nested comparisons are supported for the more complex cases.
Transfer {0<amount:[(1)==100?1:[(2)==200?2:[(3)==300?4:5]]]>}
// Default values can be set for comparison types though the default must be an accepted type for all branches.
// Comparison derived defaults are not supported at this time.
Transfer {0<amount:[(1)==721?1:uint256]=1>} {1<tokenType:uint256>}
```

Supported comparison operators:

-   `==` Equal to
-   `!=` Not equal to
-   `>` Greater than
-   `>=` Greater than or equal
-   `<` Less than
-   `<=` Less than or equal

### Dependencies

Define dependencies between inputs using the `=>` operator:

```typescript
Deposit {0<amount:uint256>} {1<token:address>} into {1=>2<vault:address>}.
```

When the value of the parent input `(1)` changes, the dependent input `(2)` will be cleared.
