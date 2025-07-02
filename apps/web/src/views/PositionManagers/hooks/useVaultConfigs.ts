import { VaultConfig } from '@pancakeswap/position-managers'
import { useActiveChainId } from '@pancakeswap/mfe'
import { usePositionManager } from 'views/PositionManagers/hooks/usePositionManager'

export function useVaultConfigs(): VaultConfig[] {
  const { chainId } = useActiveChainId()
  const data = usePositionManager(chainId)
  return data
}
