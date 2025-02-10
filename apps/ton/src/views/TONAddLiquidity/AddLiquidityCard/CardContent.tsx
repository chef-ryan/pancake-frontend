import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/ton-v2-sdk'
import { AddIcon, Box, BoxProps, Button, Flex, FlexGap, Loading, Text, useToast } from '@pancakeswap/uikit'
import { toNano } from '@ton/core'
import { setCurrencyAtom } from 'atoms/currencyAtoms'
import { currency0Atom, currency0Value, currency1Atom, currency1Value } from 'atoms/liquidity/addLiquidityStateAtom'
import { BigNumber as BN } from 'bignumber.js'
import { ConnectWalletButton } from 'components/Buttons/ConnectWalletButton'
import { SlippageButton } from 'components/Buttons/SlippageButton'
import CurrencyInputPanelSimplify from 'components/TonSwap/CurrencyInputPanelSimplify'
import { NumberDisplay } from 'components/widgets/NumberDisplay'
import { usePoolRates } from 'hooks/liquidity/usePoolRates'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { addressAtom } from 'ton/atom/addressAtom'
import { lpBalanceQueryAtom } from 'ton/atom/liquidity/lpBalanceQueryAtom'
import { poolDataQueryAtom } from 'ton/atom/liquidity/poolDataQueryAtom'
import { useAddLiquidity } from 'ton/logic/liquidity/useAddLiquidity'
import { CurrencyField } from 'types/currency'

const ContentContainer = styled(Box)<{ $isBottomRounded?: boolean }>`
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme, $isBottomRounded }) =>
    $isBottomRounded ? `0 0 ${theme.radii.card} ${theme.radii.card}` : '0'};
`

const StyledCardFooter = styled(Box)`
  padding: 24px;

  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

interface CardContentProps extends BoxProps {}
export const CardContent = (props: CardContentProps) => {
  const { t } = useTranslation()

  // TODO: Use URLs to get and set currencies
  // Query params
  // const router = useRouter()
  // const [currency0, currency1] = router.query?.currency ?? ['TON', 'USDT']

  const address = useAtomValue(addressAtom)
  const isWalletConnected = !!address

  const currency0 = useAtomValue(currency0Atom)
  const currency1 = useAtomValue(currency1Atom)
  const [token0Value, setToken0Value] = useAtom(currency0Value)
  const [token1Value, setToken1Value] = useAtom(currency1Value)

  const { data: poolData, isLoading: isPoolDataLoading } = useAtomValue(
    poolDataQueryAtom({ token0Address: currency0?.wrapped.address, token1Address: currency1?.wrapped.address }),
  )

  // TODO: Handle native token
  const { data: lpBalance } = useAtomValue(
    lpBalanceQueryAtom({
      token0Address: currency0?.wrapped.address,
      token1Address: currency1?.wrapped.address,
    }),
  )

  const shareInPool = useMemo(() => {
    if (!lpBalance || !poolData?.totalSupply) return 0n

    return BN(lpBalance.toString()).div(BN(poolData.totalSupply.toString())).times(100).toNumber()
  }, [lpBalance, poolData?.totalSupply])

  const rates = usePoolRates({
    currency0,
    currency1,
    reserve0: poolData?.reserve0,
    reserve1: poolData?.reserve1,
  })

  const setCurrency = useSetAtom(setCurrencyAtom)

  const { addLiquidity } = useAddLiquidity()

  const { toastSuccess, toastError } = useToast()

  const isDisabled = useMemo(
    () => !currency0 || !currency1 || !token0Value || !token1Value,
    [currency0, currency1, token0Value, token1Value],
  )

  const handleToken0Input = useCallback(
    (value: string) => {
      setToken0Value(value)
    },
    [setToken0Value],
  )

  const handleToken1Input = useCallback(
    (value: string) => {
      setToken1Value(value)
    },
    [setToken1Value],
  )

  const onCurrencySelection = useCallback(
    (field: CurrencyField, currency: Currency) => {
      // Check if currency is same as in the other field
      if (field === CurrencyField.ADD_LIQUIDITY_CURRENCY0 && currency.equals(currency1)) {
        setCurrency(CurrencyField.ADD_LIQUIDITY_CURRENCY1, currency0)
      } else if (field === CurrencyField.ADD_LIQUIDITY_CURRENCY1 && currency.equals(currency0)) {
        setCurrency(CurrencyField.ADD_LIQUIDITY_CURRENCY0, currency1)
      }

      setCurrency(field, currency)
    },
    [setCurrency, currency0, currency1],
  )

  const handleAddLiquidity = useCallback(async () => {
    if (isDisabled || !currency0?.wrapped.address || !currency1?.wrapped.address) return

    try {
      // TODO: Handle native currencies
      addLiquidity({
        token0: currency0,
        token1: currency1,

        // TODO: Instead of toNano use the token's decimals
        amount0: toNano(token0Value),
        amount1: toNano(token1Value),
      })

      toastSuccess(t('Liquidity added'))
    } catch (e) {
      console.error('Error adding liquidity', e)
      toastError(t('Error adding liquidity'))
    }
  }, [t, addLiquidity, toastSuccess, toastError, currency0, currency1, isDisabled, token0Value, token1Value])

  return (
    <>
      <ContentContainer $isBottomRounded={!isWalletConnected} {...props}>
        <CurrencyInputPanelSimplify
          id="add-liquidity-panel-token0"
          onUserInput={handleToken0Input}
          value={token0Value}
          currency={currency0}
          onCurrencySelect={(newCurrency) => onCurrencySelection(CurrencyField.ADD_LIQUIDITY_CURRENCY0, newCurrency)}
          showMaxButton={false}
          title={
            <Text color="textSubtle" small>
              {t('Choose a valid trading pair')}
            </Text>
          }
        />

        <AddIcon mt="12px" width={28} />

        <Box mt="-18px">
          <CurrencyInputPanelSimplify
            id="add-liquidity-panel-token1"
            onUserInput={handleToken1Input}
            value={token1Value}
            currency={currency1}
            onCurrencySelect={(newCurrency) => onCurrencySelection(CurrencyField.ADD_LIQUIDITY_CURRENCY1, newCurrency)}
            showMaxButton={false}
            showQuickInputButton={false}
          />
        </Box>

        <FlexGap flexDirection="column" mt="24px" gap="16px">
          <Flex justifyContent="space-between">
            <Text color="textSubtle">{t('Rates')}</Text>
            {poolData ? (
              <Box>
                <Text>
                  1 {currency0?.symbol} ≈ {rates.currency0.toString()} {currency1?.symbol}
                </Text>
                <Text>
                  1 {currency1?.symbol} ≈ {rates.currency1.toString()} {currency0?.symbol}
                </Text>
              </Box>
            ) : isPoolDataLoading ? (
              <>
                <Loading />
              </>
            ) : (
              <>
                <Text>{t('Pool does not exist')}</Text>
              </>
            )}
          </Flex>
          <Flex justifyContent="space-between">
            <Text color="textSubtle">{t('Your share in the pair')}</Text>

            <NumberDisplay value={shareInPool.toString()} suffix="%" maximumSignificantDigits={6} />
          </Flex>
          <Flex justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">{t('Slippage Tolerance')}</Text>

            <SlippageButton />
          </Flex>
        </FlexGap>
      </ContentContainer>

      <StyledCardFooter>
        {!isWalletConnected ? (
          <ConnectWalletButton width="100%" />
        ) : (
          <Button onClick={handleAddLiquidity} width="100%" disabled={isDisabled}>
            {t('Supply')}
          </Button>
        )}
      </StyledCardFooter>
    </>
  )
}
