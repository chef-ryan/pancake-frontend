import { storeJettonTransferMessage } from '@ton-community/assets-sdk'
import { Address, beginCell, toNano } from '@ton/core'
import { SendTransactionRequest, useTonConnectUI } from '@tonconnect/ui-react'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { addressAtom } from 'ton/atom/addressAtom'
import { TonContext } from 'ton/context/TonContext'
import { Contracts } from 'ton/def/contracts.def'
import { TON_OPCODES } from 'ton/opcodes'
import { TonContractNames } from 'ton/ton.enums'
import { JettonMasterUSDT } from 'ton/wrappers/tact_JettonMasterUSDT'

interface SwapArgs {
  token0Address: string
  token1Address: string

  amount0: bigint
  minOut?: bigint
}

export const useSwap = () => {
  const userAddress = useAtomValue(addressAtom)
  const [tonUI] = useTonConnectUI()

  const swap = useCallback(
    async ({ amount0, minOut, token0Address: token0Addr, token1Address: token1Addr }: SwapArgs) => {
      const client = TonContext.instance.getClient()
      const walletAddress = Address.parse(userAddress)
      const routerAddress = Address.parse(Contracts[TonContractNames.PCSRouter].address)

      const token0Address = Address.parse(token0Addr)
      const token1Address = Address.parse(token1Addr)

      const jettonMaster0 = client.open(JettonMasterUSDT.fromAddress(token0Address))
      const jettonMaster1 = client.open(JettonMasterUSDT.fromAddress(token1Address))

      const [userJettonWallet0, userJettonWallet1, routerJettonWallet0, routerJettonWallet1] = await Promise.all([
        jettonMaster0.getGetWalletAddress(walletAddress),
        jettonMaster1.getGetWalletAddress(walletAddress),
        jettonMaster0.getGetWalletAddress(routerAddress),
        jettonMaster1.getGetWalletAddress(routerAddress),
      ])

      const forwardPayload = beginCell()
        .storeUint(TON_OPCODES.SWAP, 32) // Opcode
        .storeAddress(routerJettonWallet1) // tokenWallet
        .storeCoins(toNano(minOut || '50')) // minOut. TODO: Compute this after getting Quoter
        .storeAddress(walletAddress) // "To" Address (User's address here)
        .storeBit(false) // hasRef
        //   .storeAddress(Address.parse('0QC9EUyepVtLv7K3PXXNfEDIpZQZkmH2OyxzQ2k5wy8--Kz-')) // refAddress. Not needed for now.
        .storeBit(true) // hasNext
        .storeRef(
          beginCell()
            .storeAddress(userJettonWallet1)
            .storeCoins(toNano('50'))
            .storeRef(beginCell().endCell())
            .endCell(),
        ) // next (SwapNext cell)
        .endCell()

      const payload = beginCell()
        .store(
          storeJettonTransferMessage({
            queryId: 1n,
            amount: toNano(amount0),
            destination: routerAddress,
            responseDestination: walletAddress,
            customPayload: null,
            forwardAmount: toNano('0.1'),
            forwardPayload,
          }),
        )
        .endCell()

      // const newPayload = beginCell()
      //   .store(
      //     storeSwap({
      //       $$type: 'Swap',
      //       queryId: 1n,
      //       amount: toNano(amount0),
      //       fromRealUser: walletAddress,
      //       fromUserAddress: walletAddress,
      //       minOut: toNano(minOut || '50'),
      //       refAddress: null,
      //       refMessageValue: 0n,
      //       tokenWallet: routerJettonWallet1,
      //       next: {
      //         $$type: 'SwapNext',
      //         minOut: 1n,
      //         tokenAddress: userJettonWallet1,
      //         next: null,
      //       },
      //     }),
      //   )
      //   .endCell()

      const txRequest: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
          {
            address: userJettonWallet0.toString(),
            amount: toNano('1').toString(),
            payload: payload.toBoc().toString('base64'),
            // payload: newPayload.toBoc().toString('base64'),
          },
        ],
      }

      tonUI.sendTransaction(txRequest)
    },
    [userAddress, tonUI],
  )

  return {
    swap,
  }
}
