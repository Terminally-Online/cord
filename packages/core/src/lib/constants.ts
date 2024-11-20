export const PLACEHOLDER_PATTERN =
    /\{(?:(\d+)=>)?(\d+)(?:<([^>:=]+)(?::([^}]+))?>)?(?:\|([^}]+))?\}/g;

export const PLACEHOLDER_SENTENCES = [
    "Transfer {0<amount:[if:1|1=721:1:else:uint256]=1>} {1<token:address:uint256>} {2<id:uint256>} to {3<recipient:address>}.",
    "Transfer {0<amount:721=1>} {1<token:address:uint256>} {2<id:uint256>} to {3<recipient:address>}.",
    "Transfer {0<amount:uint256=1>} {1<token:address:uint256>} {2<id:uint256>} to {3<recipient:address>}.",

    "Transfer {0<amount:[[1]=721?1:uint256]=1>} {1<tokenType:uint256>}.",
];
