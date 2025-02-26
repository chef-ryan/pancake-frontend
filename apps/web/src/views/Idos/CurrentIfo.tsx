import type { IDOConfig } from './config'

import { IDoCurrentCard } from './components/IdoCards/IdoCards'
import IdoContainer from './components/IdoContainer'

interface TypeProps {
  idoConfig: IDOConfig
}

const CurrentIdo: React.FC<React.PropsWithChildren<TypeProps>> = ({ idoConfig }) => {
  const steps = <></>

  return (
    <IdoContainer
      idoSection={<IDoCurrentCard idoId={idoConfig.id} bannerUrl={idoConfig.bannerUrl} />}
      idoSteps={steps}
      idoFaqs={idoConfig.faqs}
    />
  )
}

export default CurrentIdo
