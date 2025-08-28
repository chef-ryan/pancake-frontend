// TODO: Using IfosV2 components for IFO v10 testing
import { ChainId } from '@pancakeswap/chains'
// import { SUPPORTED_CHAIN_IDS } from '@pancakeswap/ifos'

// import { IfoPageLayout } from '../../views/Ifos'
// import Ifo from '../../views/Ifos/Ifo'
import { IfoPageLayout } from '../../views/IfosV2'
import IFO from '../../views/IfosV2/ifo'
import IfoTabButtons from '../../views/IfosV2/components/IfoTabButtons'

const IFO_SUPPORT_CHAINS = [ChainId.BSC, ChainId.BSC_TESTNET]

const CurrentIfoPage = () => {
  return (
    <>
      <IfoTabButtons />
      <IFO />
    </>
  )
}

CurrentIfoPage.Layout = IfoPageLayout

CurrentIfoPage.chains = IFO_SUPPORT_CHAINS

export default CurrentIfoPage
