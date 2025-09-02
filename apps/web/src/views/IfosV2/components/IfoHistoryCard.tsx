import { useMemo, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, CardBody, CardHeader, ExpandableButton, FlexGap, Text } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { CurrencyAmount, Price } from '@pancakeswap/swap-sdk-core'
import { IfoRibbon } from './IfoCards/IfoRibbon'
import { StyledLogo } from './Icons'
import { useIFODuration } from '../hooks/ifo/useIFODuration'
import useIfo from '../hooks/useIfo'

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

const TAX_PRECISION = 10000000000n

const IfoHistoryCard: React.FC = () => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const { config, info, pools } = useIfo()

  const pool0 = pools?.[0]
  const saleAmount = pool0?.saleAmount
  const raiseAmount = pool0?.raise
  const pricePerToken = pool0?.price

  const totalSale = saleAmount ? `${saleAmount.toSignificant(6)} ${saleAmount.currency.symbol}` : '-'

  const durationText = useIFODuration(info?.duration ?? 0)

  const additionalFee = useMemo(() => {
    if (pool0?.hasTax) {
      return `${Number(pool0.flatTaxRate) / 1e8}%`
    }
    return '0%'
  }, [pool0])

  const totalCommitted = useMemo(() => {
    if (!pool0 || !pool0.currency) return ''
    const amount = CurrencyAmount.fromRawAmount(pool0.currency, pool0.totalAmountPool)
    const percent =
      pool0.raisingAmountPool > 0n
        ? ((Number(pool0.totalAmountPool) / Number(pool0.raisingAmountPool)) * 100).toFixed(2)
        : '0'
    return `${amount.toSignificant(6)} ${amount.currency.symbol} (${percent}%)`
  }, [pool0])

  const fundsToRaise = raiseAmount ? `${raiseAmount.toSignificant(6)} ${raiseAmount.currency.symbol}` : ''

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

  return (
    <Card mb="24px">
      <Box position="relative">
        <Header $bannerUrl={config?.bannerUrl || ''}>
          <ExpandableButton expanded={expanded} onClick={() => setExpanded((prev) => !prev)} />
        </Header>
        {expanded && (
          <IfoRibbon
            ifoStatus={info.status}
            plannedStartTime={info.startTimestamp ? info.startTimestamp - 432000 : 0}
            startTime={info.startTimestamp}
            endTime={info.endTimestamp}
          />
        )}
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
