import { Token } from '@pancakeswap/sdk'
import { deserializeToken } from '@pancakeswap/token-lists'
import { createSelector } from '@reduxjs/toolkit'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { AppState } from '../../index'

const selectUserTokens = ({ user: { tokens } }: AppState) => tokens

export const userAddedTokenSelectorByChainIds = (chainIds: number[]) =>
  createSelector(selectUserTokens, (serializedTokensMap) =>
    chainIds.reduce<{ [address: string]: Token[] }>((tokenMap, chainId) => {
      /* eslint-disable no-param-reassign */
      tokenMap[chainId] = Object.values(serializedTokensMap?.[chainId] ?? {}).map(deserializeToken)
      return tokenMap
    }, {}),
  )

export function useUserAddedTokensByChainIds(chainIds: number[]): {
  [chainId: number]: Token[]
} {
  return useSelector(useMemo(() => userAddedTokenSelectorByChainIds(chainIds), [chainIds]))
}
