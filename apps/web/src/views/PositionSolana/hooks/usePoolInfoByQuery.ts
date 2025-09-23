import { useSolanaV3PositionIdRouteParams } from 'hooks/dynamicRoute/usePositionIdRoute'
import { useSolanaV3Pool } from 'hooks/solana/useSolanaV3Pools'
import { SolanaV3Pool } from 'state/pools/solana'

export const usePoolInfoByQuery = (): SolanaV3Pool | undefined | null => {
  const { poolId } = useSolanaV3PositionIdRouteParams()
  return useSolanaV3Pool(poolId)
}
