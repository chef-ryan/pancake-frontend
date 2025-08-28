import { Container } from '@pancakeswap/uikit'
import IfoHistoryCard from './components/IfoHistoryCard'
import { ifoConfigs } from './config'

const HistoryIfos: React.FC = () => {
  return (
    <Container p="0">
      {ifoConfigs.map((ifo) => (
        <IfoHistoryCard key={ifo.id} ifo={ifo} />
      ))}
    </Container>
  )
}

export default HistoryIfos
