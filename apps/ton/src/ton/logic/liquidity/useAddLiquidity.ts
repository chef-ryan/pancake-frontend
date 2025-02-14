import { Currency, storeAddLiquidity } from '@pancakeswap/ton-v2-sdk'
import { JETTON_TRANSFER_NOTIFICATION_OPCODE, storeJettonTransferMessage } from '@ton-community/assets-sdk'
import { beginCell, toNano } from '@ton/core'
import { SendTransactionRequest, useTonConnectUI } from '@tonconnect/ui-react'
import { setTransactionModalAtom } from 'atoms/modals/transactionModalAtom'
import { ActionType } from 'components/Modals/ActionModal'
import { useUserAddress } from 'hooks/useUserAddress'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { routerContractAtom } from 'ton/atom/contracts/routerContractAtom'
import { TonContext } from 'ton/context/TonContext'
import { generateQueryId } from 'ton/generateQueryId'
import { getJettonWalletAddress } from 'ton/utils/address'
import { formatBalance } from 'ton/utils/formatting'
import { getTransactionByBOC } from 'ton/utils/transaction'

interface AddLiquidityArgs {
  token0: Currency
  token1: Currency

  amount0: bigint
  amount1: bigint
}

export const useAddLiquidity = () => {
  const [tonUI] = useTonConnectUI()

  const userAddress = useUserAddress()
  const routerAddress = useAtomValue(routerContractAtom).address

  const setTxnModal = useSetAtom(setTransactionModalAtom)

  const addLiquidity = useCallback(
    async ({ token0, token1, amount0, amount1 }: AddLiquidityArgs) => {
      const client = TonContext.instance.getClient()

      const userJettonWallet0 = await getJettonWalletAddress(client, userAddress, token0)
      const userJettonWallet1 = await getJettonWalletAddress(client, userAddress, token1)
      const routerJettonWallet0 = await getJettonWalletAddress(client, routerAddress, token0)
      const routerJettonWallet1 = await getJettonWalletAddress(client, routerAddress, token1)

      const queryId = generateQueryId()

      const forwardPayload0 = beginCell()
        .store(
          storeAddLiquidity({
            queryId,
            $$type: 'AddLiquidity',
            minLPOut: 2n,
            tokenWallet: routerJettonWallet1,
          }),
        )
        .endCell()
      const payload0 = beginCell()
        .store(
          storeJettonTransferMessage({
            queryId,
            amount: amount0,
            destination: routerAddress,
            responseDestination: userAddress,
            customPayload: null,
            forwardAmount: toNano('0.3'),
            forwardPayload: forwardPayload0,
          }),
        )
        .endCell()

      const forwardPayload1 = beginCell()
        .store(
          storeAddLiquidity({
            queryId,
            $$type: 'AddLiquidity',
            minLPOut: 2n,
            tokenWallet: routerJettonWallet0,
          }),
        )
        .endCell()
      const payload1 = beginCell()
        .store(
          storeJettonTransferMessage({
            queryId,
            amount: amount1,
            destination: routerAddress,
            responseDestination: userAddress,
            customPayload: null,
            forwardAmount: toNano('0.3'),
            forwardPayload: forwardPayload1,
          }),
        )
        .endCell()

      const txRequest: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 60 * 2,
        messages: [
          token0.isNative
            ? {
                address: routerAddress.toString(),
                amount: (BigInt(amount0) + toNano('0.3')).toString(), // TON amount + gas
                payload: beginCell()
                  .storeUint(JETTON_TRANSFER_NOTIFICATION_OPCODE, 32)
                  .storeUint(queryId, 64)
                  .storeCoins(amount0)
                  .storeAddress(userAddress)
                  .storeMaybeRef(forwardPayload0)
                  .endCell()
                  .toBoc()
                  .toString('base64'),
              }
            : {
                address: userJettonWallet0.toString(),
                amount: toNano('0.6').toString(),
                payload: payload0.toBoc().toString('base64'),
              },
          token1.isNative
            ? {
                address: routerAddress.toString(),
                amount: (BigInt(amount1) + toNano('0.3')).toString(), // TON amount + gas
                payload: forwardPayload1.toBoc().toString('base64'),
              }
            : {
                address: userJettonWallet1.toString(),
                amount: toNano('0.6').toString(),
                payload: payload1.toBoc().toString('base64'),
              },
        ],
      }

      const { boc } = await tonUI.sendTransaction(txRequest)
      if (boc) {
        setTxnModal({
          type: ActionType.TransactionSubmitted,
          isOpen: true,
          currency0: token0,
          currency1: token1,
          amount0: formatBalance(amount0, token0.decimals),
          amount1: formatBalance(amount1, token1.decimals),
        })
      }
      const hash = await getTransactionByBOC(userAddress, boc)
      if (hash) {
        setTxnModal({
          type: ActionType.TransactionComplete,
          isOpen: true,
          currency0: token0,
          currency1: token1,
          amount0: formatBalance(amount0, token0.decimals),
          amount1: formatBalance(amount1, token1.decimals),
          hash,
        })
      }
    },
    [tonUI, userAddress, routerAddress, setTxnModal],
  )

  return {
    addLiquidity,
  }
}
