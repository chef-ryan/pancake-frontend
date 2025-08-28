import { Container } from '@pancakeswap/uikit'
import IfoHistoryCard from './components/IfoHistoryCard'
import { ifoConfigDict } from './config'

const HistoryIfos: React.FC = () => {
  const historyIfos = Object.values(ifoConfigDict).slice(1)
  return (
    <Container px="0">
      {historyIfos.map((ifo) => (
        <IfoHistoryCard key={ifo.id} ifo={ifo} />
      ))}
    </Container>
  )
}

export default HistoryIfos
