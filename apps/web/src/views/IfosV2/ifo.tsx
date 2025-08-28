import CurrentIfo from './CurrentIfo'
import { IfoV2Provider } from './contexts/IfoV2Context'

const Ifo = () => {
  return (
    <IfoV2Provider>
      <CurrentIfo />
    </IfoV2Provider>
  )
}

export default Ifo
