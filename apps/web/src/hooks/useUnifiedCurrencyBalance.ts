import {
  Currency,
  CurrencyAmount,
  SPLNativeCurrency,
  SPLToken,
  UnifiedCurrency,
  UnifiedCurrencyAmount,
} from '@pancakeswap/sdk'

import { useMemo } from 'react'
import { useSolanaTokenBalance, useSolanaTokenBalances } from 'state/token/solanaTokenBalances'
import { useCurrencyBalance, useCurrencyBalances } from '../state/wallet/hooks'
import useAccountActiveChain from './useAccountActiveChain'

export type UnifiedBalance = CurrencyAmount<Currency> | UnifiedCurrencyAmount<UnifiedCurrency>

export function useUnifiedCurrencyBalance(currency?: UnifiedCurrency | null): UnifiedBalance | undefined {
  const { account: evmAccount, solanaAccount } = useAccountActiveChain()
  const isSolana = currency && 'programId' in currency
  const solanaBalance = useSolanaTokenBalance(solanaAccount, isSolana ? currency.address : undefined)

  const evmBalance = useCurrencyBalance(evmAccount, currency as Currency)

  if (isSolana && solanaBalance) {
    return UnifiedCurrencyAmount.fromRawAmount(currency, solanaBalance.balance.toString())
  }
  if (evmBalance) {
    return evmBalance
  }
  return undefined
}

export function useUnifiedCurrencyBalances(
  currencies?: (UnifiedCurrency | undefined)[],
): (UnifiedBalance | undefined)[] {
  const { account: evmAccount, solanaAccount } = useAccountActiveChain()
  const isSolana = currencies?.some((currency) => currency && SPLToken.isSPLToken(currency))
  const solanaBalances = useSolanaTokenBalances(
    solanaAccount,
    isSolana ? currencies?.map((currency) => (currency as SPLToken | SPLNativeCurrency)?.address) : undefined,
  )
  const evmBalances = useCurrencyBalances(evmAccount, currencies as Currency[])

  return useMemo(() => {
    if (!currencies) {
      return []
    }

    if (isSolana && solanaBalances) {
      return currencies.map((currency) => {
        if (currency && SPLToken.isSPLToken(currency)) {
          const balance = solanaBalances.balances.get((currency as SPLToken | SPLNativeCurrency).address)

          if (balance) {
            return UnifiedCurrencyAmount.fromRawAmount(currency, balance.toString())
          }
        }
        return undefined
      })
    }

    return evmBalances
  }, [currencies, isSolana, solanaBalances, evmBalances])
}
