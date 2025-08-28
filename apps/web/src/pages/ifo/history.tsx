import { SUPPORTED_CHAIN_IDS } from '@pancakeswap/ifos'

import IfoProvider from 'views/Ifos/contexts/IfoContext'
import PastIfo from '../../views/Ifos/PastIfo'
import HistoryIfos from '../../views/IfosV2/HistoryIfos'

const PastIfoPage = () => {
  return (
    <IfoProvider>
      <HistoryIfos />
      <PastIfo />
    </IfoProvider>
  )
}

PastIfoPage.chains = SUPPORTED_CHAIN_IDS

export default PastIfoPage
