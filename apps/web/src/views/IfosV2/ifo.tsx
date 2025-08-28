import CurrentIfo from './CurrentIfo'
import { useCurrentIfoConfig } from './hooks/useCurrentIfoConfig'

const Ifo = () => {
  const currentIfoConfig = useCurrentIfoConfig()

  return <CurrentIfo ifoConfig={currentIfoConfig} />
}

export default Ifo
