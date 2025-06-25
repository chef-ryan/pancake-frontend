import { useAtomValue } from 'jotai'
import { styled } from 'styled-components'
import { mevStatsAtom } from './atom/mevStatsAtom'
import { Hero } from './Hero'
import { InfoSection } from './InfoSection'
import { MevIntroSection } from './MevIntroSection'

export const Wrapper = styled.div``

export const MevLanding: React.FC = () => {
  const { txCount, walletCount } = useAtomValue(mevStatsAtom)

  return (
    <Wrapper>
      <Hero txCount={txCount} />
      <MevIntroSection />
      <InfoSection walletCount={walletCount} />
    </Wrapper>
  )
}
