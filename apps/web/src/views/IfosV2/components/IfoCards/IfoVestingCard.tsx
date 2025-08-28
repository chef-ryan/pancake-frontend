import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, Card, CardBody, CardHeader, FlexGap, Image, Text } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import NextLink from 'next/link'
import { styled } from 'styled-components'
import { useIFOUserStatus } from '../../hooks/ifo/useIFOUserStatus'
import { useIFOCurrencies } from '../../hooks/ifo/useIFOCurrencies'
import { useIFOConfig } from '../../hooks/ifo/useIFOConfig'
import { useIFOClaimCallback } from '../../hooks/ifo/useIFOClaimCallback'
import { useIFOPoolInfo } from '../../hooks/ifo/useIFOPoolInfo'

const ProgressContainer = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 8px;
  background-color: #e9eaeb;
  position: relative;
  overflow: hidden;
`

const ProgressBar = styled.div<{ width: number; color: string; left?: number }>`
  position: absolute;
  top: 0;
  left: ${({ left = 0 }) => `${left}%`};
  height: 100%;
  width: ${({ width }) => `${width}%`};
  background-color: ${({ color }) => color};
`

export const IfoVestingCard: React.FC = () => {
  const { t } = useTranslation()
  const { theme, isDark } = useTheme()
  const { offeringCurrency } = useIFOCurrencies()
  const { name, id } = useIFOConfig()
  const [userStatus0, userStatus1] = useIFOUserStatus()
  const { claim, isPending } = useIFOClaimCallback()
  const { data: poolInfo } = useIFOPoolInfo()

  const totalClaimable = useMemo(() => {
    const amount0 = userStatus0?.claimableAmount
    const amount1 = userStatus1?.claimableAmount
    if (amount0 && amount1) return amount0.add(amount1)
    return amount0 ?? amount1
  }, [userStatus0, userStatus1])

  const userParticipated =
    (userStatus0?.stakedAmount?.greaterThan(0) ?? false) || (userStatus1?.stakedAmount?.greaterThan(0) ?? false)

  if (!userParticipated || !offeringCurrency) {
    return null
  }

  const claimedAll = (userStatus0?.claimed ?? false) && (userStatus1?.claimed ?? false)
  const amountString = totalClaimable?.toSignificant(6) ?? '0'

  const claimedPercent = claimedAll ? 100 : 0
  const availablePercent = claimedAll ? 0 : totalClaimable && totalClaimable.greaterThan(0) ? 100 : 0

  const handleClaim = async () => {
    if (userStatus0?.claimableAmount?.greaterThan(0) && poolInfo?.pool0Info) {
      await claim(poolInfo.pool0Info.pid)
    }
    if (userStatus1?.claimableAmount?.greaterThan(0) && poolInfo?.pool1Info) {
      await claim(poolInfo.pool1Info.pid)
    }
  }

  return (
    <Card background={isDark ? '#18171A' : theme.colors.background} mb="16px">
      <CardHeader>
        <FlexGap justifyContent="space-between" alignItems="center">
          <FlexGap flexDirection="column" gap="4px">
            <Text fontSize="20px" bold>
              {t('Token Vesting')}
            </Text>
            <Text fontSize="14px" color="textSubtle">
              {t('Claim available tokens from IFO token vesting.')}
            </Text>
          </FlexGap>
          <Image
            src={claimedAll ? '/images/ifos/vesting/in-vesting-end.svg' : '/images/ifos/vesting/in-vesting-period.svg'}
            width={64}
            height={64}
            alt="vesting-status"
          />
        </FlexGap>
      </CardHeader>
      <CardBody>
        <FlexGap flexDirection="column" gap="16px">
          <FlexGap flexDirection="column" gap="4px">
            <FlexGap gap="4px" alignItems="center">
              <Text fontSize="20px" bold>
                {offeringCurrency.symbol}
              </Text>
              <Text color="textSubtle">{name}</Text>
            </FlexGap>
            <Text fontSize="20px" bold>
              {amountString}
            </Text>
          </FlexGap>
          <FlexGap flexDirection="column" gap="8px">
            <Text fontSize="12px" bold color="secondary" textTransform="uppercase">
              {t('Vesting Schedule')}
            </Text>
            <ProgressContainer>
              {claimedPercent > 0 && <ProgressBar width={claimedPercent} color="#280D5F" />}
              {availablePercent > 0 && <ProgressBar width={availablePercent} left={claimedPercent} color="#7A6EAA" />}
            </ProgressContainer>
          </FlexGap>
          {!claimedAll ? (
            <>
              <Button
                width="100%"
                mt="8px"
                disabled={isPending || !(totalClaimable && totalClaimable.greaterThan(0))}
                onClick={handleClaim}
              >
                {t('Claim')}
              </Button>
              <NextLink href={`/ifov2/${id}`} passHref legacyBehavior>
                <Text as="a" color="primary" mt="8px" fontWeight={600} display="block">
                  {t('View IFO')}
                </Text>
              </NextLink>
            </>
          ) : (
            <Text mt="8px">{t('You have claimed all available tokens.')}</Text>
          )}
        </FlexGap>
      </CardBody>
    </Card>
  )
}

export default IfoVestingCard
