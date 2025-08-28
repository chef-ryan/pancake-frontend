import { SUPPORTED_CHAIN_IDS } from '@pancakeswap/ifos'

import PastIfo from '../../views/Ifos/PastIfo'
import HistoryIfos from '../../views/IfosV2/HistoryIfos'

const PastIfoPage = () => {
  return (
    <>
      <HistoryIfos />
      <PastIfo />
    </>
  )
}

PastIfoPage.chains = SUPPORTED_CHAIN_IDS

export default PastIfoPage
