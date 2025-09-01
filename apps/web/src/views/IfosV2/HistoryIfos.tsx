import { Container } from '@pancakeswap/uikit'
import IfoHistoryCard from './components/IfoHistoryCard'
import { ifoConfigs } from './config'
import { IfoV2Provider } from './contexts/IfoV2Context'

const HistoryIfos: React.FC = () => {
  return (
    <Container p="0">
      {ifoConfigs.map((ifo) => (
        <IfoV2Provider id={ifo.id} key={ifo.id}>
          <IfoHistoryCard ifo={ifo} />
        </IfoV2Provider>
      ))}
    </Container>
  )
}

export default HistoryIfos
