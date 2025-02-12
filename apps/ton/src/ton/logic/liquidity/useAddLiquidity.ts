import { Currency, storeAddLiquidity } from '@pancakeswap/ton-v2-sdk'
import { storeJettonTransferMessage } from '@ton-community/assets-sdk'
import { beginCell, toNano } from '@ton/core'
import { SendTransactionRequest, useTonConnectUI } from '@tonconnect/ui-react'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { addressAtom } from 'ton/atom/addressAtom'
import { routerContractAtom } from 'ton/atom/contracts/routerContractAtom'
import { TonContext } from 'ton/context/TonContext'
import { getJettonWalletAddress, parseAddress } from 'ton/utils/address'

interface AddLiquidityArgs {
  token0: Currency
  token1: Currency

  amount0: bigint
  amount1: bigint
}

export const useAddLiquidity = () => {
  const [tonUI] = useTonConnectUI()

  const userAddress_ = useAtomValue(addressAtom)
  const routerAddress = useAtomValue(routerContractAtom).address

  const addLiquidity = useCallback(
    async ({ token0, token1, amount0, amount1 }: AddLiquidityArgs) => {
      const client = TonContext.instance.getClient()
      const userAddress = parseAddress(userAddress_)

      const userJettonWallet0 = await getJettonWalletAddress(client, userAddress, token0)
      const userJettonWallet1 = await getJettonWalletAddress(client, userAddress, token1)
      const routerJettonWallet0 = await getJettonWalletAddress(client, routerAddress, token0)
      const routerJettonWallet1 = await getJettonWalletAddress(client, routerAddress, token1)

      const newForwardPayload0 = beginCell()
        .store(
          storeAddLiquidity({
            queryId: 1n,
            $$type: 'AddLiquidity',
            minLPOut: 2n,
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
            minLPOut: 2n,
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
    [tonUI, userAddress_, routerAddress],
  )

  return {
    addLiquidity,
  }
}
