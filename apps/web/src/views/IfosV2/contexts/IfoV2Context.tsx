import { createContext, useContext } from 'react'
import { useRouter } from 'next/router'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useWalletClient } from 'wagmi'
import { getIFOContract } from '../hooks/ifo/useIFOContract'
import type { IfoInfo } from '../hooks/ifo/useIFOInfo'
import { IFOConfig, ifoConfigs } from '../config'

export interface IfoV2ContextType {
  chainId: number
  ifoContract: ReturnType<typeof getIFOContract>
  config?: IFOConfig
  info?: IfoInfo
}

const IfoV2Context = createContext<IfoV2ContextType | null>(null)

export const useIfoV2Context = () => {
  const ctx = useContext(IfoV2Context)
  if (!ctx) {
    throw new Error('useIfoV2Context must be used within an IfoV2Provider')
  }
  return ctx
}

interface ProviderProps {
  id?: string
  children: React.ReactNode
}

export const IfoV2Provider: React.FC<ProviderProps> = ({ id, children }) => {
  const { chainId } = useActiveChainId()
  const { query } = useRouter()
  const { data: signer } = useWalletClient()

  const ifoId = (id ?? (query.ifo as string)) || ''

  const config = ifoId ? ifoConfigs.find((x) => x.id === ifoId) : ifoConfigs[0]
  if (!config) {
    return null
  }
  const ifoContract = getIFOContract(config?.id, signer ?? undefined, chainId)
  // info will be attached in useIfo hook
  const value = { chainId, ifoContract, config, info: undefined }

  return <IfoV2Context.Provider value={value}>{children}</IfoV2Context.Provider>
}

export default IfoV2Context
