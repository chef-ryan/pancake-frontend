import { safeGetAddress } from 'utils'
import { useCheckAndSwitchChain } from 'hooks/useCheckAndSwitchChain'
import CurrentIfo from './CurrentIfo'
import useIfo from './hooks/useIfo'
import { IfoPresetPage } from './components/IfoCards/IfoPresetCard/IfoPresetCard'

const DisplayIfo = () => {
  const { config } = useIfo()
  useCheckAndSwitchChain(config?.chainId)

  // If no contract address, use preset data
  if ((!config.contractAddress || !safeGetAddress(config.contractAddress)) && config.presetData) {
    return <IfoPresetPage />
  }

  return <CurrentIfo />
}

const Ifo = () => {
  return <DisplayIfo />
}

export default Ifo
