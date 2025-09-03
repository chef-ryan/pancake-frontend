import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody, Button, Text, FlexGap } from '@pancakeswap/uikit'

interface IfoAllocationCardProps {
  symbol: string
  tokenAddress: string
  allocatedAmount?: string
}

const IfoAllocationCard: React.FC<IfoAllocationCardProps> = ({ symbol, tokenAddress, allocatedAmount }) => {
  const { t } = useTranslation()
  const amount = allocatedAmount ?? '0'
  const swapUrl = `https://pancakeswap.finance/swap?chain=bsc&inputCurrency=${tokenAddress}&outputCurrency=BNB`

  return (
    <Card>
      <CardBody p="24px">
        <FlexGap flexDirection="column" alignItems="center" gap="16px">
          <Text textTransform="uppercase" color="secondary" bold fontSize="12px">
            {symbol} {t('allocated')}
          </Text>
          <Text fontSize="20px" bold>
            {amount}
          </Text>
          <Button as="a" href={swapUrl} target="_blank" rel="noopener noreferrer" width="100%">
            {t('Swap')} {symbol}
          </Button>
        </FlexGap>
      </CardBody>
    </Card>
  )
}

export default IfoAllocationCard
