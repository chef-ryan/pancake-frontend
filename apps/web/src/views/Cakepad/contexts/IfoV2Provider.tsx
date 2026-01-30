import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useWalletClient } from 'wagmi'
import { safeGetAddress } from 'utils'
import { getIFOContract } from '../hooks/ifo/useIFOContract'
import { ifoLoadingAnimationAtom } from '../atoms'
import { useIfoConfigs } from '../hooks/useIfoConfigs'
import { DEFAULT_CAKEPAD_IFO_ID } from '../config'
import { SyncIfoContext } from './SyncIfoContext'
import { IfoV2Context } from './IfoV2Context'

interface ProviderProps {
  id?: string
  children: React.ReactNode
}

export const IfoV2Provider: React.FC<ProviderProps> = ({ id, children }) => {
  const { query } = useRouter()
  const { data: signer } = useWalletClient()
  const { data: ifoConfigs } = useIfoConfigs()

  // Preload submitting animation
  useAtomValue(ifoLoadingAnimationAtom)

  if (!ifoConfigs) {
    return null
  }

  const envDefaultIfoId = DEFAULT_CAKEPAD_IFO_ID?.trim()
  const resolvedIfoId = id ?? (query.ifo as string | undefined) ?? (envDefaultIfoId || undefined)
  const config = resolvedIfoId ? ifoConfigs.find((x) => x.id === resolvedIfoId) ?? ifoConfigs[0] : ifoConfigs[0]
  if (!config) {
    return null
  }

  const customAddress = query.ca as string | undefined
  const ifoContract = getIFOContract(
    config?.id,
    ifoConfigs,
    signer ?? undefined,
    config.chainId,
    customAddress as `0x${string}` | undefined,
  )
  // info, pools and users will be attached in useIfo hook
  const value = { chainId: config.chainId, ifoContract, config, info: undefined, pools: undefined, users: undefined }

  return (
    <IfoV2Context.Provider value={value}>
      {/* If no contract address, don't use SyncIfoContext */}
      {(!config.contractAddress || !safeGetAddress(config.contractAddress)) && config.presetData ? (
        <>{children}</>
      ) : (
        <SyncIfoContext id={config.id}>{children}</SyncIfoContext>
      )}
    </IfoV2Context.Provider>
  )
}
