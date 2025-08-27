// Original IFO implementation for comparison
import { SUPPORTED_CHAIN_IDS } from '@pancakeswap/ifos'

import { IfoPageLayout } from '../../views/Ifos'
import Ifo from '../../views/Ifos/Ifo'

const CurrentIfoV1Page = () => {
  return <Ifo />
}

CurrentIfoV1Page.Layout = IfoPageLayout

CurrentIfoV1Page.chains = SUPPORTED_CHAIN_IDS

export default CurrentIfoV1Page
