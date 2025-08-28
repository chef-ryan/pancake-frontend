import { Container } from '@pancakeswap/uikit'
import { ReactNode } from 'react'
import { Address } from 'viem'

import { IFOFAQs } from '../config'
import IfoQuestions from './IfoQuestions'
import IfoLayout, { IfoLayoutWrapper } from './IfoLayout'
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
      <IfoLayout id="current-ifo">
        <SectionBackground>
          <Container px="0">
            <IfoLayoutWrapper>{ifoSection}</IfoLayoutWrapper>
          </Container>
        </SectionBackground>
        {ifoFaqs ? <IfoQuestions faqs={ifoFaqs} /> : null}
      </IfoLayout>
    </>
  )
}

export default IfoContainer
