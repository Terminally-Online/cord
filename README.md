![Cord image](./cord.png)

Cord is a string based language for structured sentences that enables low-code transaction (intent) data input while maintaining precise control over input definitions, options, and associated values. It allows developers to define user-facing interfaces for data entry that map to specific intents.

## Core Concepts

### Input Placeholders

Input placeholders are denoted by curly braces containing an index number, starting from 0:

```txt
{0}, {1}, {2}, etc.
```

## Usage Patterns

### Raw Substitution

For independent inputs that don't share data relationships, use simple indexed placeholders:

```txt
Deposit {0} {1} into {2}.
```

### Names

When the inputs are returned an array with name mappings can be created for simple API relaying:

```txt
Transfer {0<amount>} {1<token>} {2<id>} to {3<recipient>}.
```

### Types (and runtime validation)

You can define a single-depth `EVM` type to enable native validation on named inputs. If not provided, inputs will not be validated.

```txt
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

While single-depth types work in most cases there are situations where you will need to define a compound string as a type to enable more verbose backend decoding:

```txt
Transfer {0<amount:uint256>} {1<token:address:uint8>} {2<id:uint256>} to {3<recipient:address>}.
```

In this case, the value provided for `token` would be `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48:20` where we have defined a token address and it's standard.

### Constant Value Types

In specific cases you will want to make the type of an input strict to a value. Any type that is not a supported `EVM` type is classified as a constant value type:

```txt
Deposit {0<amount:1>} {1<token:address>} into {1=>2<vault:address>}.
```

### Default Values

In specific cases you will want default values. Simply append a `={value}` following the type definition.

```txt
Deposit {0<amount:uint256=1>} {1<token:address=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48:uint8=20>} into {1=>2<vault:address>}.
```

### Dependencies

There are situations where the value of one index is dependent on the value of another index. In this case, when the value of the parent index changes the child index should be cleared. To declare this you can define a dependent index with:

```txt
Deposit {0<amount:uint256>} {1<token:address>} into {1=>2<vault:address>}.
```

In this situation, if the value of `1` is changed after having set a value for `2`, the value of `2` will be cleared.
