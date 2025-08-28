import CurrentIfo from './CurrentIfo'
import { useCurrentIfoConfig } from './hooks/useCurrentIfoConfig'

const Ifo = () => {
  const currentIfoConfig = useCurrentIfoConfig()

  return <CurrentIfo idoConfig={currentIfoConfig} />
}

export default Ifo
