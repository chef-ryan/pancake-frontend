// import { Route, Trade } from '@pancakeswap/routing-sdk'
// import { TradeType } from '@pancakeswap/swap-sdk-core'
// import { beginCell } from '@ton/core'
// import { Contracts } from 'ton/def/contracts.def'
// import { TON_OPCODES } from 'ton/opcodes'
// import { TonContractNames } from 'ton/ton.enums'
// import { JettonHelper } from 'ton/utils/JettonHelper'

// export const msgSwap = <TType extends TradeType>(trade: Trade<TType>) => {
//   for (let i = 0; i < trade.routes.length; i++) {
//     const { path } = trade.routes[i]
//     for(let j = 0; j < path.length; j++) {
//       const route = path[j]
//       const msg = msgForRoute(route)
//     }
//   }
// }

// const msgForRoute = async (route: Route) => {
//   // If route has no tokens or the path is not valid, bail out
//   if (!route.path || route.path.length < 2) {
//     return null
//   }

//   // Example: you might have an array of amounts for each tokenOut
//   // In a real scenario, you'd derive these from the route/trade data.
//   // For demonstration, let's pretend you have them as route.amountOuts:
//   const amountOuts = route.amountOuts ?? [] // adapt as needed
//   const tokens = route.path

//   // Grab your router contract and build necessary references
//   const router = Contracts[TonContractNames.Router]

//   // Example: get the jetton wallet for the *first* token in the path
//   // so the Router can pull tokens from there. Adjust to your logic.
//   const firstTokenAddress = tokens[0]?.address
//   if (!firstTokenAddress) {
//     return null
//   }

//   // Example: you might want to specify a "min out" for the final step
//   // so you don't get front-run or pay excessive slippage. Use real logic.
//   const lpMinOut = BigInt('0') // adapt as needed

//   const routerJettonWallet = await JettonHelper.getJettonWallet(
//     firstTokenAddress,
//     TonContractNames.Router
//   )

//   // We'll build the chain of "swap steps" in reverse
//   let lastSwapNext: Cell | null = null

//   /**
//    * For route.path > 0, use the snippet:
//    *
//    *    for (let currentIndex = tokens.length - 1; currentIndex >= 2; currentIndex--) {
//    *      ...
//    *    }
//    */
//   for (let currentIndex = tokens.length - 1; currentIndex >= 2; currentIndex--) {
//     const tokenOut = tokens[currentIndex]
//     if (!tokenOut) continue

//     // For demonstration, pretend each token has a method getWalletAddress(...)
//     const walletOut = await tokenOut.getWalletAddress(router.address)

//     // We’ll pull the “amountOut” from the previous index
//     const coinsToSend = amountOuts[currentIndex - 1] ?? 0n

//     // Build the cell for this step
//     const swapNext = beginCell()
//       .storeAddress(walletOut)            // The wallet address for the next token out
//       .storeCoins(coinsToSend)           // The amount out
//       .storeMaybeRef(lastSwapNext)       // Reference the next step in the chain
//       .endCell()

//     // Now "this step" becomes the new last step
//     lastSwapNext = swapNext
//   }

//   // Build the top-level SWAP payload that references the entire chain of swaps
//   const forwardPayload = beginCell()
//     .storeUint(TON_OPCODES.SWAP, 32)     // Your SWAP opcode
//     .storeAddress(routerJettonWallet)    // The Router's jetton wallet (where tokens come from)
//     .storeCoins(lpMinOut)               // e.g. minimum final out
//     .storeRef(lastSwapNext ?? beginCell().endCell())
//     .endCell()

//   // Example message object to your Router contract
//   const message = {
//     to: router.address,
//     // Provide enough TON to pay for the gas fees (adapt as needed).
//     // E.g. "0.1" TON:
//     value: '100000000', // 0.1 TON in nanoTON
//     body: forwardPayload,
//     bounce: true,
//   }

//   return message
// }
