import { ReactNode, useMemo, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, CardBody, CardHeader, ExpandableButton, FlexGap, Text } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { CurrencyAmount, Price } from '@pancakeswap/swap-sdk-core'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'
import { IfoRibbon } from './IfoCards/IfoRibbon'
import { StyledLogo } from './Icons'
import useIfo from '../hooks/useIfo'
import { useIfoDisplay } from '../hooks/useIfoDisplay'

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

const DetailRow: React.FC<{ label: string; value: ReactNode }> = ({ label, value }) => (
  <FlexGap justifyContent="space-between" mt="8px">
    <Text color="textSubtle">{label}</Text>
    <Text textAlign="right">{value}</Text>
  </FlexGap>
)

const TAX_PRECISION = 10000000000n

const IfoHistoryCard: React.FC = () => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const { config, info, pools } = useIfo()
  const { pools: displayPools, startDisplay, endDisplay, preSaleDurationText } = useIfoDisplay()

  const pool0 = pools?.[0]
  const poolDisplay0 = displayPools?.[0]
  const saleAmount = pool0?.saleAmount
  const raiseAmount = pool0?.raise
  const pricePerToken = pool0?.price

  const totalSale = saleAmount ? `${saleAmount.toSignificant(6)} ${saleAmount.currency.symbol}` : '-'

  const additionalFee = useMemo(() => {
    if (pool0?.hasTax) {
      return `${poolDisplay0?.flatTaxRate ?? 0}%`
    }
    return '0%'
  }, [pool0, poolDisplay0])

  const totalCommitted = useMemo(() => {
    if (!pool0 || !pool0.currency) return ''
    const amount = CurrencyAmount.fromRawAmount(pool0.currency, pool0.totalAmountPool)
    const percent = poolDisplay0?.totalCommittedPercent ?? '0'
    return `${amount.toSignificant(6)} ${amount.currency.symbol} (${percent}%)`
  }, [pool0, poolDisplay0])

  const fundsToRaise = poolDisplay0?.raiseAmountText ?? ''

  const { cakeToBurn, taxAmount } = useMemo(() => {
    if (!pool0 || !pool0.currency || !pool0.hasTax) {
      return { cakeToBurn: undefined, taxAmount: undefined }
    }
    const overflow =
      pool0.totalAmountPool > pool0.raisingAmountPool ? pool0.totalAmountPool - pool0.raisingAmountPool : 0n
    if (overflow <= 0n) {
      return { cakeToBurn: undefined, taxAmount: undefined }
    }
    const taxRaw = (overflow * pool0.flatTaxRate) / TAX_PRECISION
    if (taxRaw <= 0n) {
      return { cakeToBurn: undefined, taxAmount: undefined }
    }
    const amount = CurrencyAmount.fromRawAmount(pool0.currency, taxRaw)
    return {
      cakeToBurn: `${amount.toSignificant(6)} ${amount.currency.symbol}`,
      taxAmount: amount,
    }
  }, [pool0])

  const pricePerTokenText = pricePerToken
    ? `${pricePerToken.toSignificant(6)} ${pricePerToken.quoteCurrency.symbol}`
    : ''

  const pricePerTokenWithFee = useMemo(() => {
    if (!raiseAmount || !saleAmount || !taxAmount) return ''
    const price = new Price(
      saleAmount.currency,
      raiseAmount.currency,
      saleAmount.quotient,
      raiseAmount.add(taxAmount).quotient,
    )
    return `${price.toSignificant(6)} ${price.quoteCurrency.symbol}`
  }, [raiseAmount, saleAmount, taxAmount])

  const durationText = useMemo(() => {
    if (info.status !== 'finished') {
      return preSaleDurationText
    }

    const { days } = getTimePeriods(info.duration)
    if (days < 1) {
      return (
        <>
          {startDisplay.date}
          <br />
          {startDisplay.time} - {endDisplay.time} (UTC+8)
        </>
      )
    }

    return (
      <>
        {startDisplay.date} {t('to')} <br />
        {endDisplay.date}
      </>
    )
  }, [
    endDisplay.date,
    endDisplay.time,
    info.duration,
    info.status,
    preSaleDurationText,
    startDisplay.date,
    startDisplay.time,
    t,
  ])

  return (
    <Card mb="24px">
      <Box position="relative">
        <Header $bannerUrl={config?.bannerUrl || ''}>
          <ExpandableButton expanded={expanded} onClick={() => setExpanded((prev) => !prev)} />
        </Header>
        {expanded && <IfoRibbon />}
      </Box>
      {expanded && (
        <CardBody>
          <FlexGap gap="8px" mb="16px" alignItems="center">
            {config?.icon && <StyledLogo size="40px" srcs={[config.icon]} />}
            <FlexGap flexDirection="column">
              <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
                {t('Total Sale')}
              </Text>
              <Text bold fontSize="20px" lineHeight="30px">
                {totalSale}
              </Text>
            </FlexGap>
          </FlexGap>
          <DetailRow label={t('Project Duration')} value={durationText} />
          <DetailRow label={t('Additional fee:')} value={additionalFee} />
          {totalCommitted && <DetailRow label={t('Total committed:')} value={totalCommitted} />}
          {fundsToRaise && <DetailRow label={t('Funds to raise:')} value={fundsToRaise} />}
          {cakeToBurn && <DetailRow label={t('CAKE to burn:')} value={cakeToBurn} />}
          {pricePerTokenText && (
            <DetailRow
              label={t('Price per %symbol%:', { symbol: saleAmount?.currency.symbol ?? 'TOKEN' })}
              value={pricePerTokenText}
            />
          )}
          {pricePerTokenWithFee && (
            <DetailRow
              label={t('Price per %symbol% with fee:', { symbol: saleAmount?.currency.symbol ?? 'TOKEN' })}
              value={pricePerTokenWithFee}
            />
          )}
        </CardBody>
      )}
    </Card>
  )
}

export default IfoHistoryCard
