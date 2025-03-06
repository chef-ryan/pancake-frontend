import { Currency } from '@pancakeswap/ton-v2-sdk'
import { Address } from '@ton/ton'
import { txReceiptAtom } from 'hooks/useLatestTxReceipt'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { addressAtom } from 'ton/atom/addressAtom'
import { networkAtom } from 'ton/atom/networkAtom'
import { TonContext } from 'ton/context/TonContext'
import { JettonMasterUSDT } from 'ton/wrappers/tact_JettonMasterUSDT'
import { JettonWalletUSDT } from 'ton/wrappers/tact_JettonWalletUSDT'

// TODO: refactor this after new contract interface OR use balanceOfAtom.ts
export const balanceAtom = atomFamily(
  (token?: Currency | null) =>
    atomWithQuery((get) => ({
      queryKey: ['balance', get(networkAtom), get(addressAtom), token, get(txReceiptAtom)?.hash],
      queryFn: async () => {
        if (!token) return 0n
        const client = TonContext.instance.getClient()

        if (token.isNative) return client.getBalance(Address.parse(get(addressAtom)))

        const jettonMasterContract = JettonMasterUSDT.fromAddress(Address.parse(token.address))
        const jettonMaster = client.open(jettonMasterContract)

        const jettonWalletAddress = await jettonMaster.getGetWalletAddress(Address.parse(get(addressAtom)))
        const jettonWallet = client.open(JettonWalletUSDT.fromAddress(jettonWalletAddress))

        const walletData = await jettonWallet.getGetWalletData()

        return walletData.balance
      },
      initialData: 0n,
      enabled: !!get(addressAtom) && !!token,
      staleTime: 1000 * 10, // 10 seconds
      refetchOnMount: 'always',
      refetchOnWindowFocus: 'always',
      retry: 3,
      retryDelay: 1500, // in case of RPC rate limits
    })),
  isEqual,
)
