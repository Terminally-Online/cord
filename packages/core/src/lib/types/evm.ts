type UintSizes =
    | 8
    | 16
    | 24
    | 32
    | 40
    | 48
    | 56
    | 64
    | 72
    | 80
    | 88
    | 96
    | 104
    | 112
    | 120
    | 128
    | 136
    | 144
    | 152
    | 160
    | 168
    | 176
    | 184
    | 192
    | 200
    | 208
    | 216
    | 224
    | 232
    | 240
    | 248
    | 256;

type UintType = `uint${UintSizes}`;
type IntType = `int${UintSizes}`;
type BytesType = `bytes${
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23
    | 24
    | 25
    | 26
    | 27
    | 28
    | 29
    | 30
    | 31
    | 32}`;

export type EvmType =
    | UintType
    | IntType
    | BytesType
    | "address"
    | "bool"
    | "string"
    | "bytes";