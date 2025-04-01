import { useRouter } from 'next/router'
import { IDOConfig, idoConfigDict } from '../../config'

export const useCurrentIDOConfig = (): IDOConfig | undefined => {
  const { query } = useRouter()
  const currentIdo = query.ido as string
  if (currentIdo) {
    return idoConfigDict[currentIdo]
  }
  const idoEntries = Object.entries(idoConfigDict)
  return idoEntries.length > 0 ? idoEntries[idoEntries.length - 1][1] : undefined
}
