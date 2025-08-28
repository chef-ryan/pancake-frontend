// TODO: Using IfosV2 components for IFO v10 testing
import { ChainId } from '@pancakeswap/chains'
// import { SUPPORTED_CHAIN_IDS } from '@pancakeswap/ifos'

// import { IfoPageLayout } from '../../views/Ifos'
// import Ifo from '../../views/Ifos/Ifo'
import { IdoPageLayout } from '../../views/IfosV2'
import IFO from '../../views/IfosV2/ido'

const IFO_SUPPORT_CHAINS = [ChainId.BSC, ChainId.BSC_TESTNET]

const CurrentIfoPage = () => {
  return <IFO />
}

CurrentIfoPage.Layout = IdoPageLayout

CurrentIfoPage.chains = IFO_SUPPORT_CHAINS

export default CurrentIfoPage
