import { useCountdown } from '@pancakeswap/hooks'
import { IfoStatus } from '@pancakeswap/ifos'
import { useTranslation } from '@pancakeswap/localization'
import { Flex, Skeleton, Text } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import { styled } from 'styled-components'
import { useEffect, useRef } from 'react'
import useIfo from 'views/IfosV2/hooks/useIfo'
import { useSetAtom } from 'jotai'
import { updateIfoVer } from 'views/IfosV2/atom/ifoVersionAtom'

interface Props {
  plannedStartTime: number
  startTime: number
  endTime: number
  ifoStatus: IfoStatus
  dark?: boolean
}

const FlexGap = styled(Flex)<{ gap: string }>`
  gap: ${({ gap }) => gap};
`

const CountdownText = styled(Text)`
  font-family: Kanit;
  font-size: 16px;
  font-weight: 400;

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 24px;
    font-weight: 600;
    text-decoration-line: underline;
    text-decoration-style: dashed;
  }
`

const CountDown: React.FC<{
  time: number
  textColor?: string
}> = ({ time, textColor }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const color = textColor ?? theme.colors.secondary
  const { days, hours, minutes, seconds } = useCountdown(time) ?? { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const start = useRef(false)
  const { info } = useIfo()
  const updateVersion = useSetAtom(updateIfoVer)

  useEffect(() => {
    if (!info || info.status !== 'idle') {
      return
    }
    if (seconds > 0) {
      start.current = true
      return
    }
    if (start.current) {
      if (seconds === 0) {
        updateVersion()
      }
    }
  }, [seconds, info, updateVersion])

  const segments = [
    { value: days, suffix: t('d') },
    { value: hours, suffix: t('h') },
    { value: minutes, suffix: t('m') },
    { value: seconds, suffix: t('s') },
  ].filter((segment) => segment.value > 0) as { value: number; suffix: string }[]

  if (segments.length === 0) {
    segments.push({ value: 0, suffix: t('s') })
  }

  return (
    <FlexGap gap="4px" alignItems="baseline">
      {segments.map((segment, index) => (
        <CountdownText key={`${segment.suffix}-${index}`} color={color}>
          {segment.value}
          {segment.suffix}
          {index < segments.length - 1 ? ' :' : ''}
        </CountdownText>
      ))}
    </FlexGap>
  )
}

export const SoonTimer: React.FC<React.PropsWithChildren<Props>> = ({ startTime, ifoStatus, plannedStartTime }) => {
  const { theme } = useTheme()
  const textColor = theme.colors.secondary
  const { t } = useTranslation()

  const countdownDisplay =
    ifoStatus !== 'idle' ? (
      <>
        <FlexGap gap="8px" alignItems="center">
          <Text
            fontSize={['16px', '16px', '24px']}
            fontFamily="Kanit"
            fontWeight={['600', '600', '400']}
            color={textColor}
          >
            {t('Starts in')}:
          </Text>
          <CountDown time={startTime} />
        </FlexGap>
      </>
    ) : null

  const countdown = countdownDisplay

  return (
    <Flex justifyContent="center" position="relative">
      {ifoStatus === 'idle' ? <Skeleton animation="pulse" variant="rect" width="100%" height="48px" /> : countdown}
    </Flex>
  )
}

const LiveTimer: React.FC<React.PropsWithChildren<Pick<Props, 'endTime' | 'ifoStatus'>>> = ({ endTime, ifoStatus }) => {
  const { t } = useTranslation()

  const timeDisplay =
    ifoStatus !== 'idle' ? (
      <>
        <FlexGap gap="8px" alignItems="center">
          <Text textTransform="uppercase" fontSize={['16px', '16px', '24px']} bold color="#FBCB01">
            {`${t('Live Now')}!`}
          </Text>
          <Text fontSize={['16px', '16px', '24px']} color="white" fontFamily="Kanit" fontWeight={['600', '600', '400']}>
            {t('Ends in')}:
          </Text>
          <CountDown time={endTime} textColor="white" />
        </FlexGap>
      </>
    ) : null

  const timeNode = timeDisplay

  return (
    <Flex justifyContent="center" position="relative">
      {ifoStatus === 'idle' ? <Skeleton animation="pulse" variant="rect" width="100%" height="48px" /> : timeNode}
    </Flex>
  )
}

export default LiveTimer
