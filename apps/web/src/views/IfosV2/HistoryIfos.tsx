import { Container } from '@pancakeswap/uikit'
import IfoHistoryCard from './components/IfoHistoryCard'
import { ifoConfigs } from './config'
import { IfoV2Provider } from './contexts/IfoV2Provider'

const HistoryIfos: React.FC = () => {
  return (
    <Container p="0">
      {ifoConfigs.map((ifo) => (
        <IfoV2Provider id={ifo.id} key={ifo.id}>
          <IfoHistoryCard />
        </IfoV2Provider>
      ))}
    </Container>
  )
}

export default HistoryIfos
