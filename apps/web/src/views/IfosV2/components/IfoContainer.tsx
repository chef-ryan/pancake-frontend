import { Container } from '@pancakeswap/uikit'
import { ReactNode } from 'react'
import { Address } from 'viem'

import { IFOFAQs } from '../config'
import IfoQuestions from './IfoQuestions'
import { SectionBackground } from './SectionBackground'

interface TypeProps {
  ifoSection: ReactNode
  ifoSteps: ReactNode
  ifoAddress?: Address
  ifoFaqs?: IFOFAQs
}

const IfoContainer: React.FC<React.PropsWithChildren<TypeProps>> = ({ ifoSection, ifoFaqs }) => {
  return (
    <>
      <SectionBackground>
        <Container px="0">{ifoSection}</Container>
      </SectionBackground>
      {ifoFaqs ? <IfoQuestions faqs={ifoFaqs} /> : null}
    </>
  )
}

export default IfoContainer
