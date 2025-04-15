## Introduction

The new Quoter provides a more modular and flexible approach to fetching on-chain/off-chain trade quotes. By splitting the logic across multiple atoms, hooks, and utility functions, we can better manage complexity and performance within the swap interface.

---

## QuoteQuery and Uniq Hash

---

QuoteQuery is a type that encapsulates all parameters needed to request a trade quote. It includes information such as:
• Which tokens are being swapped (baseCurrency, currency).  
• The swapped amount.  
• The trade type (EXACT_INPUT or EXACT_OUTPUT).  
• Whether to enable certain features, e.g., v2Swap, v3Swap, infinitySwap, stableSwap.  
• Slippage tolerance and chain info.

```typescript
export interface QuoteQuery {
  hash: string
  amount?: CurrencyAmount<Currency>
  baseCurrency?: Currency | null
  currency?: Currency | null
  tradeType?: TradeType
  maxHops?: number
  maxSplits?: number
  v2Swap?: boolean
  v3Swap?: boolean
  infinitySwap: boolean
  stableSwap?: boolean
  enabled?: boolean
  autoRevalidate?: boolean
  trackPerf?: boolean
  retry?: number | boolean
  type?: 'offchain' | 'quoter' | 'auto' | 'api'
  speedQuoteEnabled: boolean
  xEnabled: boolean
  slippage?: number
  address?: Address
}
```

** hash **
For efficiency and caching, every QuoteQuery generates a unique "hash". This hash is produced by combining critical parts of the query (currencies, amounts, chainID, etc.) and taking a keccak256 of their stringified representation. Two queries with identical parameters will have the same hash, which allows us to memoize or reuse existing data.

You can see how the hash is generated in the file:  
• src/quoter/utils/PoolHashHelper.ts  
• src/quoter/utils/createQuoteQuery.ts

## bestQuoteAtom

The core logic for combining all quote sources (off-chain quoter, quoter worker, or API) resides in bestQuoteAtom. It is constructed via several pieces:

• bestQuoteWithoutHashAtom – This atom runs the main logic:

1. Checks user input (currency and amount).
2. Creates any number of specialized queries (e.g., single-hop, multi-hop, Infinity routing, etc.).
3. For each sub-query, calls separate atoms (bestAMMTradeFromOffchainQuoterAtom, bestAMMTradeFromQuoterWorkerAtom, bestTradeFromApi, etc.) to fetch candidate trades.
4. Finds the best route among those trades (e.g., by comparing the final input or output amounts).

• bestQuoteAtom – This is essentially the same data as bestQuoteWithoutHashAtom, but it adds the unique hash to the result.

Once bestQuoteAtom is read from the store, you get an object that includes:
• trade: The best trade found.  
• hash: The unique identifier for that query.  
• error/loading states if applicable.

For reference, see:
• src/quoter/atom/bestQuoteAtom.ts

## Handle User Input

Whenever the user changes currencies, amounts, or toggles advanced options (like InfinitySwap or v2Swap), the application builds a new QuoteQuery. This triggers a full chain of updates:

1. A new QuoteQuery is generated with a fresh hash (see createQuoteQuery).
2. bestQuoteAtom is invalidated if the hash changes.
3. bestQuoteAtom then spawns calls to relevant quote provider atoms (off-chain, on-chain).
4. The combined best trade is stored in Jotai, and your UI will automatically update.

For example, in src/quoter/hook/useQuoterSync.ts:  
• We read the user’s typed value.  
• We build a QuoteQuery.  
• We call bestQuoteAtom(quoteQuery).  
• We store the final best trade object in a local UI-friendly atom.

## Get Started

In the new quoter architecture, you must wrap your application (or portion of it) with QuoterProvider. This ensures that we have the necessary context (chainId, enabled swaps, etc.) for building correct QuoteQuery objects.

## Step A: QuoterProvider

// Example usage in your highest-level component:

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QuoteProvider } from './quoter/QuoteProvider';

function App() {
return (
<QuoteProvider>
{/_ your app content _/}
<MainSwapPanel />
</QuoteProvider>
);
}

---

• QuoterProvider automatically sets up QuoteContext and ensures that multi-call/pool/worker logic can function.  
• See src/quoter/QuoteProvider.tsx and src/quoter/hook/QuoteContext.tsx for details.

## Step B: The useAllTypeBestTrade Hook

import React from 'react';
import { useAllTypeBestTrade } from './quoter/hook/useAllTypeBestTrade';

function MainSwapPanel() {
const {
bestOrder,
tradeLoaded,
tradeError,
refreshOrder,
pauseQuoting,
resumeQuoting,
} = useAllTypeBestTrade();

if (tradeError) {
return <div>There was an error: {tradeError.message}</div>;
}

if (!tradeLoaded) {
return <div>Loading best trade...</div>;
}

return (
<div>
{/_ Show final best order info _/}
<pre>{JSON.stringify(bestOrder, null, 2)}</pre>
<button onClick={refreshOrder}>Refresh</button>
<button onClick={pauseQuoting}>Pause</button>
<button onClick={resumeQuoting}>Resume</button>
</div>
);
}

• The useAllTypeBestTrade hook retrieves an object from bestTradeUISyncAtom that merges trade data, loading state, and higher-level controls (refresh, pause, etc.).  
• You can display bestOrder in your swap UI, or do additional logic with tradeLoaded and tradeError.

## Conclusion

By adopting this new Quoter architecture, you gain:
• A more robust and extensible quoting system (plug in new quote providers easily).  
• Automatic caching and deduplication thanks to hashing logic.  
• Seamless UI updates via Jotai.  
• Fine-grained controls for revalidation, pausing, and refreshing quotes.

For more details, check out the relevant files under /apps/web/src/quoter, especially:
• atom/ – The Jotai-based store.  
• hook/ – The main React hooks that wire up everything.  
• utils/ – Helper functions, hashing, and verification logic.
