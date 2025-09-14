# Quote Routing Visualization

This document visualizes the `quoter` function of PancakeSwap.

1. Visualize the flow of the algorithm.

2. Visualize how calls happen
   - For api calls , using the api path as a node
   - For contract calls using `call [contractName].[contractFunction]

3. Parts
   - Part I: Same Chain Quoter in `apps/web`
   - Part II: Cross Chain Quoter in `apps/web`
   - Part III: The `quoter-worker` -> `Smart Router`
   - Part IV: The `quoter-worker` -> `Routing SDK`
   - Part V: The `edge API`
   - Part VI: The `svm` related flow, entry is `bestSVMOrderAtom`

## Part I (Same Chain Quoter in apps/web)

### Entry

`apps/web/src/quoter/atom/bestSameChainAtom.ts`

### Related Files

- `apps/web/src/hooks/useCurrencyUsdPrice.ts`
- `apps/web/src/quote-worker.ts`
- `apps/web/src/quoter/atom/bestAMMTradeFromQuoterWorker2Atom.ts`
- `apps/web/src/quoter/atom/bestAMMTradeFromQuoterWorkerAtom.ts`
- `apps/web/src/quoter/atom/bestRoutingSDKTradeAtom.ts`
- `apps/web/src/quoter/atom/bestSVMOrderAtom.ts`
- `apps/web/src/quoter/atom/bestSameChainAtom.ts`
- `apps/web/src/quoter/atom/bestXAPIAtom.ts`
- `apps/web/src/quoter/atom/routingStrategy.ts`
- `apps/web/src/quoter/utils/gasPriceAtom.ts`
- `apps/web/src/quoter/utils/getVerifiedTrade.ts`

### Flowchart

```mermaid
flowchart TD
    S[bestSameChainAtom]
    S --> RS[routingStrategyAtom]
    RS --> RS1["GET PROOF_API/cms-config/tokens-routing-config.json"]

    S --> QA[bestXAPIAtom]
    QA --> QA1["POST QUOTING_API"]

    S --> SVM[bestSVMOrderAtom]

    S --> BW1[bestAMMTradeFromQuoterWorkerAtom]
    S --> BW2[bestRoutingSDKTradeAtom]
    S --> BW3[bestAMMTradeFromQuoterWorker2Atom]

    BW1 --> EP1a["GET EDGE_ENDPOINT/api/pools/candidates"]
    EP1a --> SR[SmartRouter.getBestTrade]
    BW2 --> EP1b["GET EDGE_ENDPOINT/api/pools/candidates"]
    EP1b --> RS[routing-sdk.findBestTrade]
    BW3 --> EP1c["GET EDGE_ENDPOINT/api/pools/candidates"]
    EP1c --> SR

    BW2 --> V[getVerifiedTrade]
    V --> V1["call multi Quoter.quote"]

    BW1 --> USD[currencyUSDPriceAtom]
    BW2 --> USD
    BW3 --> USD
    USD --> WALLET["GET WALLET_API/v1/prices/list"]

    BW1 --> GP[gasPriceWeiAtom]
    BW2 --> GP
    BW3 --> GP
    GP --> GAS["call PublicClient.getGasPrice"]
```

## Part II (Cross Chain Quoter in apps/web)

### Entry

`apps/web/src/quoter/atom/bestCrossChainAtom.ts`

### Related Files

- `apps/web/src/quoter/atom/availableBridgeRoutesAtom.ts`
- `apps/web/src/quoter/atom/bestCrossChainAtom.ts`
- `apps/web/src/quoter/atom/bridgeOnlyQuoteAtom.ts`
- `apps/web/src/quoter/atom/bestSameChainAtom.ts`
- `apps/web/src/quoter/utils/crosschain-utils/CrossChainPatternClassifier.ts`
- `apps/web/src/quoter/utils/crosschain-utils/utils/ContextBuilder.ts`

### Flowchart

```mermaid
flowchart TD
    A[bestCrossChainQuoteAtom]
    A -->|cross-chain| B[bestCrossChainQuoteWithoutPlaceHolderAtom]
    A -->|same chain| S[bestSameChainAtom]

    B --> R[availableBridgeRoutesAtom]
    R --> R1["GET BRIDGE_API_ENDPOINT/v1/routes"]
    R --> P[CrossChainPatternClassifier]
    P --> METADATA["POST BRIDGE_API_ENDPOINT/v1/metadata"]
    P --> S
```

## Part III (quoter-worker -> Smart Router)

### Entry

`packages/smart-router/evm/v3-router/getBestTrade.ts`

### Related Files

- `apps/web/src/quote-worker.ts`
- `packages/smart-router/evm/v3-router/getRoutesWithValidQuote.ts`
- `packages/smart-router/evm/v3-router/providers/onChainQuoteProvider.ts`
- `packages/smart-router/evm/v3-router/functions/computeAllRoutesNew.ts`
- `packages/smart-router/evm/v3-router/functions/getBestRouteCombinationByQuotes.ts`

### Flowchart

```mermaid
flowchart TD
    SR[SmartRouter.getBestTrade]
    SR --> CP[poolProvider.getCandidatePools]
    CP --> V2["call multi PancakePair.getReserves"]
    CP --> V3["call multi PancakeV3Pool.slot0"]
    CP --> ST["call multi StableSwap.getReserves"]
    SR --> WA["GET WALLET_API/v1/prices"]
    SR --> RT[computeAllRoutesNew]
    SR --> GM[createGasModel]
    SR --> VQ[getRoutesWithValidQuote]
    VQ --> QC["call multicall Quoter.quote"]
    SR --> BR[getBestRouteCombinationByQuotes]
    BR -->|result| MAIN[main thread]
```

This phase gathers candidate pools, computes viable routes, quotes them through the on-chain quoter contracts, and finally
selects the optimal route combination based on gas and output metrics.

## Part IV (quoter-worker -> Routing SDK)

### Entry

`packages/routing-sdk/src/findBestTrade.ts`

### Related Files

- `apps/web/src/quote-worker.ts`
- `packages/routing-sdk/src/graph/index.ts`
- `packages/routing-sdk/src/utils/getBetterTrade.ts`
- `packages/routing-sdk/src/stream/index.ts`

### Flowchart

```mermaid
flowchart TD
    RS[routing-sdk.findBestTrade]
    RS --> GP[groupPoolsByType]
    RS --> CG[createGraph]
    RS --> ST[getBestTradeByStreams]
    ST --> PC[priceCalculator.evaluate]
    RS -->|best trade| MAIN[main thread]
```

The routing SDK operates off chain: pools are grouped, a graph is built, and a price calculator evaluates possible streams of
routes to determine the best trade. No on-chain quoter calls are performed in this phase.

## Part V (edge API)

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

## Part VI (svm flow)

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
