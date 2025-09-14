# Quote Routing Visualization

This document sketches the background for how the quoter computes prices in
PancakeSwap. It follows the atoms that initiate a quote, the worker threads that
resolve routing, and the external APIs and smart contracts contacted along the
way. The diagrams below break down the cross‑chain and same‑chain flows, the
quote worker logic, and the `/api/pools/candidates` helper endpoint.

## Part I (atom)

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
    BW1 --> W[quote-worker]
    BW1 --> EP1["GET EDGE_ENDPOINT/api/pools/candidates"]

    S --> BW2[bestRoutingSDKTradeAtom]
    BW2 --> W
    BW2 --> EP1

    S --> BW3[bestAMMTradeFromQuoterWorker2Atom]
    BW3 --> W
    BW3 --> EP1

    USD[currencyUSDPriceAtom]
    GP[gasPriceWeiAtom]
    USD --> BW1
    USD --> BW2
    USD --> BW3
    GP --> BW1
    GP --> BW2
    GP --> BW3
```

## Part II (worker)

```mermaid
flowchart TD
    QW[quote-worker]
    QW --> SR2[SmartRouter.getBestTrade]
    QW --> RS2[routing-sdk.findBestTrade]

    SR2 --> WA2["GET WALLET_API/v1/prices"]
    SR2 --> M32["call Multicall3.tryBlockAndAggregate"]
    M32 --> V22["call PancakePair.getReserves"]
    M32 --> V32["call PancakeV3Pool.slot0"]
    M32 --> ST2["call StableSwap.getReserves"]

    RS2 --> QA2["POST QUOTING_API"]

    SR2 -->|result| MAIN[main thread]
    RS2 -->|result| MAIN
```

## Part III (edge API)

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
