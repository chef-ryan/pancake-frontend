import { IfoCurrentCard } from './components/IfoCards/IfoCards'
import IfoContainer from './components/IfoContainer'
import type { IFOConfig } from './config'

interface TypeProps {
  ifoConfig: IFOConfig | undefined
}

const CurrentIfo: React.FC<React.PropsWithChildren<TypeProps>> = ({ ifoConfig }) => {
  const steps = <></>

  if (!ifoConfig) {
    return null
  }

  return (
    <IfoContainer
      ifoSection={<IfoCurrentCard ifoId={ifoConfig.id} bannerUrl={ifoConfig.bannerUrl} />}
      ifoSteps={steps}
      ifoFaqs={ifoConfig.faqs}
    />
  )
}

export default CurrentIfo
