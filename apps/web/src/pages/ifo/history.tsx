import { SUPPORTED_CHAIN_IDS } from '@pancakeswap/ifos'

import { IfoPageLayout } from '../../views/Ifos'
import PastIfo from '../../views/Ifos/PastIfo'
import HistoryIfos from '../../views/IfosV2/HistoryIfos'
import IfoTabButtons from '../../views/IfosV2/components/IfoTabButtons'

const PastIfoPage = () => {
  return (
    <>
      <IfoTabButtons />
      <HistoryIfos />
      <PastIfo />
    </>
  )
}

PastIfoPage.Layout = IfoPageLayout

PastIfoPage.chains = SUPPORTED_CHAIN_IDS

export default PastIfoPage
