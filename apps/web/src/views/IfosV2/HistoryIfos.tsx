import { Container } from '@pancakeswap/uikit'
import IfoHistoryCard from './components/IfoHistoryCard'
import { idoConfigDict } from './config'

const HistoryIfos: React.FC = () => {
  const historyIfos = Object.values(idoConfigDict).slice(1)
  return (
    <Container px="0">
      {historyIfos.map((ido) => (
        <IfoHistoryCard key={ido.id} ido={ido} />
      ))}
    </Container>
  )
}

export default HistoryIfos
