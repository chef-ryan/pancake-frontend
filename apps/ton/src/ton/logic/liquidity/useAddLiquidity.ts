import { Currency } from '@pancakeswap/ton-v2-sdk'
import { storeJettonTransferMessage } from '@ton-community/assets-sdk'
import { beginCell, toNano } from '@ton/core'
import { SendTransactionRequest, useTonConnectUI } from '@tonconnect/ui-react'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { addressAtom } from 'ton/atom/addressAtom'
import { TonContext } from 'ton/context/TonContext'
import { Contracts } from 'ton/def/contracts.def'
import { TonContractNames } from 'ton/ton.enums'
import { getJettonWalletAddress, parseAddress } from 'ton/utils/address'
import { storeAddLiquidity } from 'ton/wrappers/tact_Router'

interface AddLiquidityArgs {
  token0: Currency
  token1: Currency

  amount0: bigint
  amount1: bigint
}

export const useAddLiquidity = () => {
  const userAddress_ = useAtomValue(addressAtom)
  const [tonUI] = useTonConnectUI()

  const addLiquidity = useCallback(
    async ({ token0, token1, amount0, amount1 }: AddLiquidityArgs) => {
      const client = TonContext.instance.getClient()
      const userAddress = parseAddress(userAddress_)
      const routerAddress = parseAddress(Contracts[TonContractNames.PCSRouter].testnet.address)

      const userJettonWallet0 = await getJettonWalletAddress(client, userAddress, token0)
      const userJettonWallet1 = await getJettonWalletAddress(client, userAddress, token1)
      const routerJettonWallet0 = await getJettonWalletAddress(client, routerAddress, token0)
      const routerJettonWallet1 = await getJettonWalletAddress(client, routerAddress, token1)

      // const forwardPayload0 = beginCell()
      //   .storeUint(TON_OPCODES.ADD_LIQUIDITY, 32)
      //   .storeAddress(routerJettonWallet1)
      //   .storeCoins(toNano(900)) // MinLP
      //   .endCell()
      // const payload0 = beginCell()
      //   .store(
      //     storeJettonTransferMessage({
      //       queryId: 1n,
      //       amount: amount0,
      //       destination: routerAddress,
      //       responseDestination: walletAddress,
      //       customPayload: null,
      //       forwardAmount: toNano('0.1'),
      //       forwardPayload: forwardPayload0,
      //     }),
      //   )
      //   .endCell()

      // const forwardPayload1 = beginCell()
      //   .storeUint(TON_OPCODES.ADD_LIQUIDITY, 32)
      //   .storeAddress(routerJettonWallet0)
      //   .storeCoins(toNano(900)) // MinLP
      //   .endCell()
      // const payload1 = beginCell()
      //   .store(
      //     storeJettonTransferMessage({
      //       queryId: 2n,
      //       amount: amount1,
      //       destination: routerAddress,
      //       responseDestination: walletAddress,
      //       customPayload: null,
      //       forwardAmount: toNano('0.1'),
      //       forwardPayload: forwardPayload1,
      //     }),
      //   )
      //   .endCell()

      // const txRequest: SendTransactionRequest = {
      //   validUntil: Math.floor(Date.now() / 1000) + 60 * 2,
      //   messages: [
      //     {
      //       address: userJettonWallet0.toString(),
      //       amount: toNano('0.2').toString(),
      //       payload: payload0.toBoc().toString('base64'),
      //     },
      //     {
      //       address: userJettonWallet1.toString(),
      //       amount: toNano('0.2').toString(),
      //       payload: payload1.toBoc().toString('base64'),
      //     },
      //   ],
      // }

      // tonUI.sendTransaction(txRequest)

      /// NEW WAY OF SENDING ADD LIQUIDITY TXN

      const newForwardPayload0 = beginCell()
        .store(
          storeAddLiquidity({
            queryId: 1n,
            $$type: 'AddLiquidity',
            minLPOut: 0n,
            tokenWallet: routerJettonWallet1,
          }),
        )
        .endCell()
      const payload0 = beginCell()
        .store(
          storeJettonTransferMessage({
            queryId: 1n,
            amount: amount0,
            destination: routerAddress,
            responseDestination: userAddress,
            customPayload: null,
            forwardAmount: toNano('0.3'),
            forwardPayload: newForwardPayload0,
          }),
        )
        .endCell()

      const newForwardPayload1 = beginCell()
        .store(
          storeAddLiquidity({
            queryId: 2n,
            $$type: 'AddLiquidity',
            minLPOut: 0n,
            tokenWallet: routerJettonWallet0,
          }),
        )
        .endCell()
      const payload1 = beginCell()
        .store(
          storeJettonTransferMessage({
            queryId: 2n,
            amount: amount1,
            destination: routerAddress,
            responseDestination: userAddress,
            customPayload: null,
            forwardAmount: toNano('0.3'),
            forwardPayload: newForwardPayload1,
          }),
        )
        .endCell()

      const txRequest: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 60 * 2,
        messages: [
          {
            address: userJettonWallet0.toString(),
            amount: toNano('0.2').toString(),
            payload: payload0.toBoc().toString('base64'),
          },
          {
            address: userJettonWallet1.toString(),
            amount: toNano('0.2').toString(),
            payload: payload1.toBoc().toString('base64'),
          },
        ],
      }

      tonUI.sendTransaction(txRequest)

      /// NEW WAY OF SENDING ADD LIQUIDITY TXN

      // const newForwardPayload0 = beginCell()
      //   .store(
      //     storeAddLiquidity({
      //       queryId: 1n,
      //       $$type: 'AddLiquidity',
      //       minLPOut: 0n,
      //       newAmount0: amount0,
      //       newAmount1: amount1,
      //     }),
      //   )
      //   .endCell()

      // const payload0 = beginCell()
      //   .store(
      //     storeJettonTransferMessage({
      //       queryId: 1n,
      //       amount: amount0,
      //       destination: routerAddress,
      //       responseDestination: walletAddress,
      //       customPayload: null,
      //       forwardAmount: toNano('0.1'),
      //       forwardPayload: newForwardPayload0,
      //     }),
      //   )
      //   .endCell()

      // const newForwardPayload1 = beginCell()
      //   .store(
      //     storeAddLiquidity({
      //       queryId: 2n,
      //       $$type: 'AddLiquidity',
      //       minLPOut: 0n,
      //       newAmount0: amount0,
      //       newAmount1: amount1,
      //     }),
      //   )
      //   .endCell()

      // const payload1 = beginCell()
      //   .store(
      //     storeJettonTransferMessage({
      //       queryId: 2n,
      //       amount: amount1,
      //       destination: routerAddress,
      //       responseDestination: walletAddress,
      //       customPayload: null,
      //       forwardAmount: toNano('0.1'),
      //       forwardPayload: newForwardPayload1,
      //     }),
      //   )
      //   .endCell()

      const newTxRequest: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 60 * 2,
        messages: [
          {
            address: userJettonWallet0.toString(),
            amount: toNano('0.6').toString(),
            payload: payload0.toBoc().toString('base64'),
          },
          {
            address: userJettonWallet1.toString(),
            amount: toNano('0.6').toString(),
            payload: payload1.toBoc().toString('base64'),
          },
        ],
      }

      tonUI.sendTransaction(newTxRequest)
    },
    [tonUI, userAddress_],
  )

  return {
    addLiquidity,
  }
}
