import { useRouter } from 'next/router'
import { IFOConfig, ifoConfigDict } from '../config'

export const useCurrentIfoConfig = (): IFOConfig | undefined => {
  const { query } = useRouter()
  const currentIfo = query.ifo as string | undefined
  return ifoConfigDict[currentIfo || ''] || Object.values(ifoConfigDict)[0]
}
