import { INetworkProps, ITokenProps, toTokenValueByCurrency } from '@pancakeswap/widgets-internal'
import { useMemo } from 'react'
import { getKeyForPools, useAccountStableLpDetails } from 'state/farmsV4/hooks'
import { POSITION_STATUS, StableLPDetail } from 'state/farmsV4/state/accountPositions/type'
import { useAccount } from 'wagmi'
import { useAllChainIds } from './useMultiChains'

export const useStablePositions = ({
  selectedNetwork,
  selectedTokens,
  positionStatus,
  farmsOnly,
}: {
  selectedNetwork: INetworkProps['value']
  selectedTokens: ITokenProps['value']
  positionStatus: POSITION_STATUS
  farmsOnly: boolean
}) => {
  const { address: account } = useAccount()
  const allChainIds = useAllChainIds()
  const { data: stablePositions, pending: stableLoading } = useAccountStableLpDetails(allChainIds, account)

  const filteredStablePositions = useMemo(
    () =>
      stablePositions.filter(
        (pos) =>
          selectedNetwork.includes(pos.pair.liquidityToken.chainId) &&
          (!selectedTokens?.length ||
            selectedTokens.some(
              (token) =>
                token === toTokenValueByCurrency(pos.pair.token0) || token === toTokenValueByCurrency(pos.pair.token1),
            )) &&
          [POSITION_STATUS.ALL, POSITION_STATUS.ACTIVE].includes(positionStatus) &&
          (!farmsOnly || pos.isStaked),
      ),
    [farmsOnly, selectedNetwork, selectedTokens, stablePositions, positionStatus],
  )

  return {
    stableLoading,
    stablePositions: filteredStablePositions,
  }
}

export const getStablePositionKey = (pos: StableLPDetail) => {
  const {
    pair: {
      liquidityToken: { chainId, address },
    },
  } = pos
  return getKeyForPools({ chainId, poolAddress: address })
}
