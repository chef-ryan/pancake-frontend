import { useIfoV2Context } from '../contexts/IfoV2Context'
import { useIFOInfo } from './ifo/useIFOInfo'

const useIfo = () => {
  const ctx = useIfoV2Context()
  const info = useIFOInfo()
  return { ...ctx, info }
}

export default useIfo
