import { Ifo } from '@pancakeswap/ifos'
import { Box, Card, CardHeader, Container } from '@pancakeswap/uikit'

import { useInActiveIfoConfigs } from 'hooks/useIfoConfig'

import HistoryIfos from 'views/Cakepad/HistoryIfos'
import { styled } from 'styled-components'
import { getBannerUrl } from './helpers'

const StyledCard = styled(Card)`
  width: 100%;
  margin: auto;
  border-radius: 32px;
`

const Header = styled(CardHeader)<{ ifoId: string }>`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 112px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  background-color: ${({ theme }) => theme.colors.dropdown};
  background-image: ${({ ifoId }) => `url('${getBannerUrl(ifoId)}')`};
`

const PastIfoCard = ({ ifo }: { ifo: Ifo }) => (
  <Box id={ifo.id} position="relative" mb="10px">
    <StyledCard>
      <Header ifoId={ifo.id} />
    </StyledCard>
  </Box>
)

const PastIfo = ({ isV2 }: { isV2?: boolean }) => {
  const inactiveIfo = useInActiveIfoConfigs()

  return (
    <Container id="past-ifos" py={['24px', '24px', '40px']} maxWidth="736px" m="auto" width="100%">
      {isV2 && <HistoryIfos />}
      {inactiveIfo?.map((ifo) => (
        <PastIfoCard key={ifo.id} ifo={ifo} />
      ))}
    </Container>
  )
}

export default PastIfo
