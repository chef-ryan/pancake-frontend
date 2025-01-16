import { Currency, Token } from '@pancakeswap/routing-sdk-addon-ton'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

export const currencyFamily = atomFamily((field: string) => atom(undefined as Currency | undefined))
export const setCurrencyAtom = atom(null, (_, set, field: string, currency: Currency | undefined) => {
  set(
    currencyFamily(field),
    currency &&
      (currency.isNative
        ? ({
            isNative: true,
            isToken: false,
            symbol: 'TON',
            name: 'TON',
            decimals: 9,
            chainId: currency.chainId,
            logoURI: currency.logoURI,
            equals: () => false,
            wrapped: null as any,
          } as Currency)
        : new Token(
            currency.chainId,
            currency.address,
            currency.decimals,
            currency.symbol,
            currency.name,
            currency.logoURI,
          )),
  )
})
