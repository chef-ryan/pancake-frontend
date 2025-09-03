import { useIFOPoolInfo } from './ifo/useIFOPoolInfo'
import { useIFOInfo } from './ifo/useIFOInfo'
import { useIfoV2Context } from '../contexts/useIfoV2Context'

const useIfo = () => {
  const ctx = useIfoV2Context()

  const info = useIFOInfo()
  const pools = useIFOPoolInfo()

  return { ...ctx, info, pools }
}

export default useIfo
