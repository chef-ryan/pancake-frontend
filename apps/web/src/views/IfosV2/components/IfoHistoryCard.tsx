import { useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, CardBody, CardHeader, ExpandableButton, FlexGap, Text } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { IfoRibbon } from 'views/Ifos/components/IfoFoldableCard/IfoRibbon'
import { StyledLogo } from './Icons'
import type { IDOConfig } from '../config'

const Header = styled(CardHeader)<{ $bannerUrl: string }>`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 112px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-color: ${({ theme }) => theme.colors.dropdown};
  background-image: ${({ $bannerUrl }) => `url('${$bannerUrl}')`};
`

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <FlexGap justifyContent="space-between" mt="8px">
    <Text color="textSubtle">{label}</Text>
    <Text textAlign="right">{value}</Text>
  </FlexGap>
)

const IfoHistoryCard: React.FC<{ ido: IDOConfig }> = ({ ido }) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  return (
    <Card mb="24px">
      <Box position="relative">
        <Header $bannerUrl={ido.bannerUrl}>
          <ExpandableButton expanded={expanded} onClick={() => setExpanded((prev) => !prev)} />
        </Header>
        {expanded && <IfoRibbon ifoStatus="finished" plannedStartTime={0} startTime={0} endTime={0} />}
      </Box>
      {expanded && (
        <CardBody>
          <FlexGap gap="8px" mb="16px" alignItems="center">
            {ido.icon && <StyledLogo size="40px" srcs={[ido.icon]} />}
            <FlexGap flexDirection="column">
              <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
                {t('Total Sale')}
              </Text>
              <Text bold fontSize="20px" lineHeight="30px">
                0 TOKEN
              </Text>
            </FlexGap>
          </FlexGap>
          <DetailRow label={t('Project Duration')} value="0" />
          <DetailRow label={t('Additional fee:')} value="1%" />
          <DetailRow label={t('Total committed:')} value="~$33,956,437 (33972.19%)" />
          <DetailRow label={t('Funds to raise:')} value="$90,000" />
          <DetailRow label={t('CAKE to burn:')} value="124,428.45 (~$338,564.83)" />
          <DetailRow label={t('Price per TOKENX:')} value="$0.0310559006" />
          <DetailRow label={t('Price per TOKENX with fee:')} value="~$0.1362" />
        </CardBody>
      )}
    </Card>
  )
}

export default IfoHistoryCard
