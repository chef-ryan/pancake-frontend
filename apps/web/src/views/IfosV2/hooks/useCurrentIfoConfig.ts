import { useRouter } from 'next/router'
import { IDOConfig, idoConfigDict } from '../../config'

export const useCurrentIfoConfig = (): IDOConfig | undefined => {
  const { query } = useRouter()
  const currentIfo = query.ifo as string | undefined
  return idoConfigDict[currentIfo] || Object.values(idoConfigDict)[0]
}
