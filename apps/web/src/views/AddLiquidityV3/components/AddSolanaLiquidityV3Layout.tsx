import { atom, useAtom } from 'jotai'
import { useMemo } from 'react'
import styled from 'styled-components'
import { Box, Breadcrumbs, Container, FlexGap, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import { useTranslation } from '@pancakeswap/localization'
import { useUnifiedCurrency } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useAccountActiveChain'
import { useSolanaDerivedInfo } from 'hooks/solana/useSolanaDerivedInfo'
import { useSolanaPoolByMint, useSolanaPoolsByMint } from 'hooks/solana/useSolanaPoolsByMint'
import { PoolInfoHeader } from 'components/PoolInfoHeader'

import { SELECTOR_TYPE } from '../types'
import { useCurrencyParams } from '../hooks/useCurrencyParams'
import { useV3FormState } from '../formViews/V3FormView/form/reducer'
import { useHeaderInvertCurrencies } from '../hooks/useHeaderInvertCurrencies'

const selectTypeAtom = atom(SELECTOR_TYPE.V3)
const LinkText = styled(Text)`
  color: ${({ theme }) => theme.colors.primary60};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`

export function AddSolanaLiquidityV3Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const { currencyIdA, currencyIdB, feeAmount } = useCurrencyParams()

  const baseCurrency = useUnifiedCurrency(currencyIdA)
  const quoteCurrency = useUnifiedCurrency(currencyIdB)
  const poolInfo = useSolanaPoolByMint(baseCurrency?.wrapped.address, quoteCurrency?.wrapped.address, feeAmount)

  const inverted = useMemo(
    () =>
      Boolean(
        poolInfo?.token0 &&
          poolInfo?.token1 &&
          poolInfo?.token0.address !== poolInfo?.token1.address &&
          poolInfo?.token0.address !== baseCurrency?.wrapped.address,
      ),
    [poolInfo, baseCurrency],
  )

  const { handleInvertCurrencies } = useHeaderInvertCurrencies({ currencyIdA, currencyIdB, feeAmount })

  const currencyA = poolInfo?.token0 ?? baseCurrency ?? undefined
  const currencyB = poolInfo?.token1 ?? quoteCurrency ?? undefined

  return (
    <Container mx="auto" my="24px" maxWidth="1200px">
      <Box mb="24px">
        <Breadcrumbs>
          <NextLinkFromReactRouter to="/liquidity/pools">
            <LinkText>{t('Farms')}</LinkText>
          </NextLinkFromReactRouter>
          {chainId && poolInfo && (
            <NextLinkFromReactRouter to="">
              <LinkText>{t('Pool Detail')}</LinkText>
            </NextLinkFromReactRouter>
          )}
          <FlexGap alignItems="center" gap="4px">
            <Text>{t('Add Liquidity')}</Text>
          </FlexGap>
        </Breadcrumbs>
      </Box>
      <PoolInfoHeader
        linkType="addLiquidity"
        poolInfo={poolInfo}
        chainId={chainId}
        currency0={currencyA}
        currency1={currencyB}
        isInverted={inverted}
        onInvertPrices={handleInvertCurrencies}
        poolId={poolInfo?.id}
        overrideAprDisplay={{ aprDisplay: <></>, roiCalculator: <></> }}
      />
      {children}
    </Container>
  )
}
