import { Address } from '@ton/ton'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import { addressAtom } from 'ton/atom/addressAtom'
import { networkAtom } from 'ton/atom/networkAtom'
import { TonContext } from 'ton/context/TonContext'
import { JettonMasterUSDT } from 'ton/wrappers/tact_JettonMasterUSDT'
import { JettonWalletUSDT } from 'ton/wrappers/tact_JettonWalletUSDT'

// TODO: temporary balance atom. refactor this after new contract interface OR use balanceOfAtom.ts (preferred)
export const balanceAtom = atomFamily((tokenAddress?: string) =>
  atomWithQuery((get) => ({
    queryKey: ['balance', get(networkAtom), get(addressAtom), tokenAddress],
    queryFn: async () => {
      if (!tokenAddress) return 0n
      const client = TonContext.instance.getClient()
      const jettonMasterContract = JettonMasterUSDT.fromAddress(Address.parse(tokenAddress))
      const jettonMaster = client.open(jettonMasterContract)

      const jettonWalletAddress = await jettonMaster.getGetWalletAddress(Address.parse(get(addressAtom)))
      const jettonWallet = client.open(JettonWalletUSDT.fromAddress(jettonWalletAddress))

      const walletData = await jettonWallet.getGetWalletData()

      return walletData.balance
    },
    initialData: 0n,
    enabled: !!tokenAddress,
    staleTime: 1000 * 10, // 10 seconds
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    retry: 3,
    retryDelay: 1500, // in case of RPC rate limits
  })),
)
