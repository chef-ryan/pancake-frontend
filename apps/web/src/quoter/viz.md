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

    S --> BW1[bestAMMTradeFromQuoterWorkerAtom]
    BW1 --> W[quote-worker]
    BW1 --> EP1["GET EDGE_ENDPOINT/api/pools/candidates"]
    BW1 --> EP2["GET EDGE_ENDPOINT/api/pools/tvlref"]

    S --> BW2[bestRoutingSDKTradeAtom]
    BW2 --> W
    BW2 --> EP1
    BW2 --> EP2

    S --> BW3[bestAMMTradeFromQuoterWorker2Atom]
    BW3 --> W
    BW3 --> EP1
    BW3 --> EP2
```

## Part II (worker)

```mermaid
flowchart TD
    QW[quote-worker]
    QW --> SR2[SmartRouter.getBestTrade]
    QW --> RS2[routing-sdk.findBestTrade]

    SR2 --> WA2["GET WALLET_API/v1/prices"]
    SR2 --> M32["Multicall3.tryBlockAndAggregate"]
    M32 --> V22["PancakePair.getReserves"]
    M32 --> V32["PancakeV3Pool.slot0"]
    M32 --> ST2["StableSwap.getReserves"]

    SR2 -->|result| MAIN[main thread]
    RS2 -->|result| MAIN
```

## Part III (edge API)

```mermaid
flowchart TD
    H["GET /api/pools/candidates"]
    H --> PARSE[parseCandidatesQuery]
    PARSE --> EDGE["edgeQueries.fetchAllCandidatePools(Lite)"]
    EDGE --> INF["GET EXPLORE_API_ENDPOINT/cached/pools/candidates/infinity/{chain}/{addressA}/{addressB}"]
    EDGE --> V2F["PancakeV2Factory.getPair"]
    EDGE --> V3F["PancakeV3Factory.getPool"]
    EDGE --> STF["StableSwapFactory.getPool"]
    EDGE -->|response| RES[Return candidates JSON]
```
