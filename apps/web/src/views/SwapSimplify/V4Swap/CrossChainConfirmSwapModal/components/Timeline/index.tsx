import {
  CheckmarkCircleFillIcon,
  CircleOutlineIcon,
  FlexGap,
  ScanLink,
  SwapLoading,
  WarningIcon,
} from '@pancakeswap/uikit'
import { useCallback } from 'react'
import styled, { css } from 'styled-components'
import { getBlockExploreLink } from 'utils'

export type TimelineItemStatus = 'completed' | 'inProgress' | 'failed' | 'warning' | 'notStarted'

export interface TimelineItemProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  status: TimelineItemStatus
  errorMessage?: string
  warningMessage?: string
  isLast?: boolean
  id: string
  tx?: {
    hash: string
    chainId: number
  }
}

const TimelineWrapper = styled(FlexGap).attrs({ flexDirection: 'column' })``

const ItemContainer = styled(FlexGap).attrs({ alignItems: 'center', gap: '8px' })`
  display: flex;
  width: 100%;
`

const IconColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
  min-height: inherit;
`

const Line = styled.div`
  width: 2px;
  height: 100%;
  min-height: 18px;
  flex: 1;
  margin-left: 10px;
  background-color: ${({ theme }) => theme.colors.inputSecondary};
`

const ItemWrapper = styled(FlexGap).attrs({ alignItems: 'center', gap: '12px' })`
  padding: 8px 0;
  width: 100%;
`

const IconWrapper = styled.div<{ status: TimelineItemStatus }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;

  ${({ status, theme }) => {
    switch (status) {
      case 'completed':
        return css`
          color: ${theme.colors.success};
        `
      case 'failed':
        return css`
          color: ${theme.colors.failure};
        `
      case 'warning':
        return css`
          color: ${theme.colors.warning60};
        `
      default:
        return css`
          color: ${theme.colors.textDisabled};
        `
    }
  }}
`

const Content = styled.div`
  flex: 1;
`

const Title = styled.div<{ status: TimelineItemStatus }>`
  color: ${({ status, theme }) => {
    switch (status) {
      case 'completed':
        return theme.colors.primary60
      case 'failed':
        return theme.colors.failure
      case 'warning':
        return theme.colors.warning60
      default:
        return theme.colors.text
    }
  }};
  font-size: 14px;
  font-weight: 600;
`

const Subtitle = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
  margin-left: 4px;
`

const MessageBox = styled.div<{ variant: 'error' | 'warning' }>`
  margin-top: 8px;
  background: ${({ variant, theme }) => (variant === 'error' ? theme.colors.destructive10 : theme.colors.warning10)};
  border: 1px solid
    ${({ variant, theme }) => (variant === 'error' ? theme.colors.destructive20 : theme.colors.warning20)};
  border-radius: 16px;
  padding: 8px 12px;
  font-size: 14px;
`

const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  subtitle,
  icon,
  status,
  errorMessage,
  warningMessage,
  isLast,
  tx,
}) => {
  const getDefaultIcon = useCallback(() => {
    switch (status) {
      case 'completed':
        return <CheckmarkCircleFillIcon color="success" />
      case 'warning':
        return <WarningIcon color="binance" />
      case 'failed':
        return <WarningIcon color="binance" />
      case 'inProgress':
        return <SwapLoading />
      case 'notStarted':
        return <CircleOutlineIcon color="textDisabled" />
      default:
        return <div style={{ width: 24, height: 24 }} />
    }
  }, [status])

  return (
    <>
      <ItemContainer>
        <IconColumn>
          <IconWrapper status={status}>{icon || getDefaultIcon()}</IconWrapper>
        </IconColumn>
        <ItemWrapper>
          <Content>
            <Title status={status}>
              {title}
              {subtitle && <Subtitle>({subtitle})</Subtitle>}
            </Title>
            {status === 'failed' && errorMessage && <MessageBox variant="error">{errorMessage}</MessageBox>}
            {status === 'warning' && warningMessage && <MessageBox variant="warning">{warningMessage}</MessageBox>}
          </Content>
        </ItemWrapper>
        {tx && (
          <ScanLink
            href={getBlockExploreLink(tx.hash, 'transaction', tx.chainId)}
            color="primary60"
            useBscCoinFallback
          />
        )}
      </ItemContainer>
      {!isLast && <Line />}
    </>
  )
}

export interface TimelineProps {
  items: TimelineItemProps[]
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const isLastItem = useCallback((item: TimelineItemProps) => item === items[items.length - 1], [items])

  return (
    <TimelineWrapper>
      {items.map((item) => (
        <TimelineItem key={item.id} {...item} isLast={isLastItem(item)} />
      ))}
    </TimelineWrapper>
  )
}
