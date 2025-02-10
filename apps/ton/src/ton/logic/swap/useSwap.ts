import { Currency } from '@pancakeswap/ton-v2-sdk'
import { storeJettonTransferMessage } from '@ton-community/assets-sdk'
import { Address, Builder, Cell, beginCell, toNano } from '@ton/core'
import { SendTransactionRequest, useTonConnectUI } from '@tonconnect/ui-react'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { addressAtom } from 'ton/atom/addressAtom'
import { TonContext } from 'ton/context/TonContext'
import { Contracts } from 'ton/def/contracts.def'
import { TON_OPCODES } from 'ton/opcodes'
import { TonContractNames } from 'ton/ton.enums'
import { getJettonWalletAddress, parseAddress } from 'ton/utils/address'

type SwapNext = {
  $$type: 'SwapNext'
  tokenAddress: Address
  minOut: bigint
  next: Cell | null
}

type Swap = {
  $$type: 'Swap'
  fromUserAddress: Address
  tokenWallet: Address
  minOut: bigint
  fromRealUser: Address
  refAddress: Address | null
  refMessageValue: bigint
  next: SwapNext | null
}

export function storeSwap(src: Swap) {
  return (builder: Builder) => {
    const b0 = builder
    b0.storeUint(TON_OPCODES.SWAP, 32)
      .storeAddress(src.tokenWallet)
      .storeCoins(src.minOut)
      .storeAddress(src.fromUserAddress)
    if (src.refAddress !== null) {
      b0.storeBit(true).storeAddress(src.refAddress)
    } else {
      b0.storeBit(false)
    }
    b0.storeCoins(src.refMessageValue)

    const b1 = new Builder()
    if (src.next !== null && src.next !== undefined) {
      b0.storeBit(true)
      b1.store(storeSwapNext(src.next))
    } else {
      b0.storeBit(false)
    }

    b0.storeRef(b1.endCell())
  }
}

export function storeSwapNext(src: SwapNext) {
  return (builder: Builder) => {
    const b0 = builder
    b0.storeAddress(src.tokenAddress)
    b0.storeCoins(src.minOut)
    if (src.next !== null && src.next !== undefined) {
      b0.storeBit(true).storeRef(src.next)
    } else {
      b0.storeBit(false)
    }
  }
}

interface SwapArgs {
  token0: Currency
  token1: Currency
  amount0: string
  minOut: string
}

export const useSwap = () => {
  const userAddress_ = useAtomValue(addressAtom)
  const [tonUI] = useTonConnectUI()

  const swap = useCallback(
    async ({ amount0, minOut, token0, token1 }: SwapArgs) => {
      const client = TonContext.instance.getClient()
      const userAddress = parseAddress(userAddress_)
      const routerAddress = parseAddress(Contracts[TonContractNames.PCSRouter].testnet.address)

      const userJettonWallet0 = await getJettonWalletAddress(client, userAddress, token0)
      const routerJettonWallet1 = await getJettonWalletAddress(client, routerAddress, token1)

      const forwardPayload = beginCell()
        .store(
          storeSwap({
            $$type: 'Swap',
            fromRealUser: userAddress,
            fromUserAddress: userAddress,
            minOut: toNano(minOut),
            refAddress: null,
            refMessageValue: 0n,
            tokenWallet: routerJettonWallet1,
            next: null,
          }),
        )
        .endCell()

      const payload = beginCell()
        .store(
          storeJettonTransferMessage({
            queryId: 1n,
            // input amount
            amount: toNano(amount0),
            destination: routerAddress,
            responseDestination: userAddress,
            customPayload: null,
            forwardAmount: toNano('0.5'),
            forwardPayload,
          }),
        )
        .endCell()

      const txRequest: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
          {
            address: userJettonWallet0.toString(),
            // Attached TON for fees, not the amount of jettons to transfer!
            amount: toNano('0.6').toString(),
            payload: payload.toBoc().toString('base64'),
          },
        ],
      }

      tonUI.sendTransaction(txRequest)
    },
    [userAddress_, tonUI],
  )

  return {
    swap,
  }
}
