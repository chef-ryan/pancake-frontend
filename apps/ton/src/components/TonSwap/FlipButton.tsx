import { AutoColumn } from '@pancakeswap/uikit'

import { memo, useCallback } from 'react'

import { AutoRow } from 'components/Layout/Row'
// import { useSwapState } from 'state/swap/hooks'
import { styled } from 'styled-components'

import replaceBrowserHistoryMultiple from '@pancakeswap/utils/replaceBrowserHistoryMultiple'
import { currencyFamily } from 'atoms/swap/swapStateAtom'
import { SwapUIV2 } from 'components/widgets/swap-v2'
import { useSwapActionHandlers } from 'hooks/swap/useSwapActionHandlers'
import { useAtomValue } from 'jotai'
import { Field } from 'types'

export const Line = styled.div`
  position: absolute;
  left: -16px;
  right: -16px;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.cardBorder};
  top: calc(50% + 6px);
`

export const FlipButton = memo(function FlipButton() {
  // const lottieRef = useRef<LottieRefCurrentProps | null>(null)

  const { onSwitchTokens } = useSwapActionHandlers()
  // const {
  //   [Field.INPUT]: { currencyId: inputCurrencyId },
  //   [Field.OUTPUT]: { currencyId: outputCurrencyId },
  // } = useSwapState()

  const inputCurrency = useAtomValue(currencyFamily(Field.INPUT))
  const outputCurrency = useAtomValue(currencyFamily(Field.OUTPUT))

  const onFlip = useCallback(() => {
    onSwitchTokens()
    replaceBrowserHistoryMultiple({
      inputCurrency: outputCurrency?.isToken ? outputCurrency.address : outputCurrency?.symbol,
      outputCurrency: inputCurrency?.isToken ? inputCurrency.address : inputCurrency?.symbol,
    })
  }, [onSwitchTokens, inputCurrency, outputCurrency])

  return (
    <AutoColumn justify="space-between" position="relative">
      <Line />
      <AutoRow justify="center" style={{ padding: '0 1rem', marginTop: '1em' }}>
        <SwapUIV2.SwitchButtonV2 onClick={onFlip} />

        {/* <Lottie
          lottieRef={lottieRef}
          animationData={ArrowLottie}
          style={{ height: '78px', cursor: 'pointer' }}
          onClick={onFlip}
          autoplay={false}
          loop={false}
          onMouseEnter={() => lottieRef.current?.playSegments([19, 32], true)}
          onMouseLeave={() => lottieRef.current?.playSegments([52, 73], true)}
        /> */}
      </AutoRow>
    </AutoColumn>
  )
})
