import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { Card, CardBody, CardFooter, Flex, Text } from '@pancakeswap/uikit'
import dynamic from 'next/dynamic'
import { useEffect, useState, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useTokenUsdcPrice } from 'hooks/useStablePrice'
import { LottieComponentProps } from 'lottie-react'

const Lottie = dynamic<LottieComponentProps>(() => import('lottie-react'), { ssr: false })

interface IfoSubmittingCardProps {
  deposit: CurrencyAmount<Currency>
}

const IfoSubmittingCard: React.FC<React.PropsWithChildren<IfoSubmittingCardProps>> = ({ deposit }) => {
  const { t } = useTranslation()
  const [animationData, setAnimationData] = useState<any>()

  useEffect(() => {
    fetch('https://assets.pancakeswap.finance/web/ifos/loading.json')
      .then((res) => res.json())
      .then(setAnimationData)
  }, [])

  const tokenPrice = useTokenUsdcPrice(deposit.currency)

  const usdValue = useMemo(() => {
    try {
      return new BigNumber(deposit.toExact()).times(tokenPrice).toFixed(2)
    } catch (error) {
      return '0'
    }
  }, [deposit, tokenPrice])

  return (
    <Card>
      <CardBody p="24px" display="flex" alignItems="center" justifyContent="center">
        {animationData && <Lottie animationData={animationData} loop style={{ width: 200 }} />}
      </CardBody>
      <CardFooter p="24px">
        <Card p="16px" borderRadius="16px" width="100%">
          <Text fontSize="14px" color="textSubtle">
            {t('Deposit Amount')}: {deposit.toSignificant(6)} {deposit.currency.symbol}
          </Text>
          <Flex justifyContent="flex-end">
            <Text fontSize="14px" color="textSubtle">
              ~{usdValue} USD
            </Text>
          </Flex>
        </Card>
      </CardFooter>
    </Card>
  )
}

export default IfoSubmittingCard
