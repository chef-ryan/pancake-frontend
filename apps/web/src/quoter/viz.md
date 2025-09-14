# Quote Routing Visualization

This document visualize the `quoter` function of pancakeswap.

1. Visualize the flow of the algorithm.

2. Visualize how calls happens

   - For api calls , using the api path as a node
   - For contract calls using `call [contractName].[contractFunction]

3. Parts
   - Part I: flow in `apps/web`, entry is `bestCrossChainQuoteAtom`
   - Part II: The `quoter-worker` -> `Smart Router`
   - Part III: The `quoter-worker` -> `Routing SDK`
   - Part IV: The `edge API`
   - Part V: The `svm` related flow, entry is `bestSVMOrderAtom`

## Part I ( apps/web/quoter )

### Entry

`apps/web/src/quoter/atom/bestCrossChainAtom.ts`

### Related Files

- `apps/web/src/quoter/atom/bestSameChainAtom.ts`
- `apps/web/src/quoter/atom/availableBridgeRoutesAtom.ts`
- `apps/web/src/quoter/utils/crosschain-utils/CrossChainPatternClassifier.ts`
- `apps/web/src/quoter/atom/routingStrategy.ts`
- `apps/web/src/quoter/atom/bestXAPIAtom.ts`
- `apps/web/src/quoter/atom/bestSVMOrderAtom.ts`
- `apps/web/src/quoter/atom/bestAMMTradeFromQuoterWorkerAtom.ts`
- `apps/web/src/quoter/atom/bestRoutingSDKTradeAtom.ts`
- `apps/web/src/quoter/atom/bestAMMTradeFromQuoterWorker2Atom.ts`
- `apps/web/src/quote-worker.ts`
- `apps/web/src/hooks/useCurrencyUsdPrice.ts`
- `apps/web/src/quoter/utils/gasPriceAtom.ts`

### Flowchart

```mermaid
flowchart TD
    A[bestCrossChainQuoteAtom]
    A -->|cross-chain| B[bestCrossChainQuoteWithoutPlaceHolderAtom]
    A -->|same chain| S[bestSameChainAtom]

    B --> R[availableBridgeRoutesAtom]
    R --> R1["GET BRIDGE_API_ENDPOINT/v1/routes"]

    B --> P[CrossChainPatternClassifier]
    P --> METADATA["POST BRIDGE_API_ENDPOINT/v1/metadata"]
    P --> S

    S --> RS[routingStrategyAtom]
    RS --> RS1["GET PROOF_API/cms-config/tokens-routing-config.json"]

    S --> QA[bestXApiAtom]
    QA --> QA1["POST QUOTING_API"]

    S --> SVM[bestSVMOrderAtom]

    S --> BW1[bestAMMTradeFromQuoterWorkerAtom]
    S --> BW2[bestRoutingSDKTradeAtom]
    S --> BW3[bestAMMTradeFromQuoterWorker2Atom]

    BW1 --> EP1["GET EDGE_ENDPOINT/api/pools/candidates"]
    BW2 --> EP1
    BW3 --> EP1
    EP1 --> W[quote-worker]

    USD[currencyUSDPriceAtom]
    USD --> WALLET["GET WALLET_API/v1/prices/list"]
    USD --> BW1
    USD --> BW2
    USD --> BW3

    GP[gasPriceWeiAtom]
    GP --> GAS["call PublicClient.getGasPrice"]
    GP --> BW1
    GP --> BW2
    GP --> BW3
```

## Part II (quoter-worker -> Smart Router)

### Entry

`apps/web/src/quote-worker.ts`

### Related Files

- `packages/smart-router/evm/v3-router/getBestTrade.ts`

### Flowchart

```mermaid
flowchart TD
    QW[quote-worker]
    QW --> SR[SmartRouter.getBestTrade]
    SR --> WA["GET WALLET_API/v1/prices"]
    WA --> M3["call Multicall3.tryBlockAndAggregate"]
    M3 --> V2["call PancakePair.getReserves"]
    M3 --> V3["call PancakeV3Pool.slot0"]
    M3 --> ST["call StableSwap.getReserves"]
    SR -->|result| MAIN[main thread]
```

## Part III (quoter-worker -> Routing SDK)

### Flowchart

```mermaid
flowchart TD
    QW[quote-worker]
    QW --> RS[routing-sdk.findBestTrade]
    RS --> QA["POST QUOTING_API"]
    QA -->|result| MAIN[main thread]
```

### Entry

`apps/web/src/quote-worker.ts`

### Related Files

- `packages/routing-sdk/src/findBestTrade.ts`

## Part IV (edge API)

### Entry

`apps/web/src/pages/api/pools/candidates.ts`

### Related Files

- `apps/web/src/quoter/utils/edgeQueries.util.ts`
- `apps/web/src/quoter/utils/edgePoolQueries.ts`

### Flowchart

```mermaid
flowchart TD
    H["GET /api/pools/candidates"]
    H --> PARSE[parseCandidatesQuery]
    PARSE --> EDGE_LITE["edgeQueries.fetchAllCandidatePoolsLite"]
    PARSE --> EDGE_FULL["edgeQueries.fetchAllCandidatesFull"]
    EDGE_LITE --> TVL["GET EDGE_ENDPOINT/api/pools/tvlref"]
    EDGE_FULL --> TVL
    EDGE_LITE --> INF["GET EXPLORE_API_ENDPOINT/cached/pools/candidates/infinity/{chain}/{addressA}/{addressB}"]
    EDGE_FULL --> INF
    EDGE_LITE --> V2F["call PancakeV2Factory.getPair"]
    EDGE_LITE --> V3F["call PancakeV3Factory.getPool"]
    EDGE_LITE --> STF["call StableSwapFactory.getPool"]
    EDGE_FULL --> V2F
    EDGE_FULL --> V3F
    EDGE_FULL --> STF
    EDGE_LITE -->|response| RES[Return candidates JSON]
    EDGE_FULL -->|response| RES
```

## Part V (svm flow)

### Entry

`apps/web/src/quoter/atom/bestSVMOrderAtom.ts`

### Related Files

- `packages/utils/user/slippage.ts`
- `packages/utils/user/solanaPriorityFee.ts`
- `packages/solana-router-sdk/src/getBestTrade.ts`
- `apps/web/src/quoter/utils/svm-utils/parseSVMTradeIntoSVMOrder.ts`

### Flowchart

```mermaid
flowchart TD
    SVM[bestSVMOrderAtom]
    SVM --> SLIPPAGE[solanaUserSlippageAtomWithLocalStorage]
    SVM --> PRIORITY[solanaPriorityFeeAtomWithLocalStorage]
    SVM --> GS[getBestSolanaTrade]
    GS --> ULTRA["GET ULTRA_API_ENDPOINT/ultra/v1/order"]
    ULTRA --> PARSE[parseSVMTradeIntoSVMOrder]
    PARSE --> RESULT[InterfaceOrder]
```
