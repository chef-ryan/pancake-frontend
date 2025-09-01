import { useIfoV2Context } from '../contexts/IfoV2Context'
import { useIFOPoolInfo } from './ifo/useIFOPoolInfo'
import { useIFOInfo } from './ifo/useIFOInfo'
import type { PoolInfo } from '../ifo.types'

const useIfo = () => {
  const ctx = useIfoV2Context()
  const info = useIFOInfo()
  const pools: PoolInfo[] = useIFOPoolInfo()

  return { ...ctx, info, pools }
}

export default useIfo
