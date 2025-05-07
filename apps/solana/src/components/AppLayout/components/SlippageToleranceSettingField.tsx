import { Flex } from '@chakra-ui/react'
import { Box, Button, Input, Message, Text } from '@pancakeswap/uikit'
import Decimal from 'decimal.js'
import { KeyboardEvent, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { SWAP_SLIPPAGE_KEY, useSwapStore } from '@/features/Swap/useSwapStore'
import { useEvent } from '@/hooks/useEvent'
import { LIQUIDITY_SLIPPAGE_KEY, useAppStore, useLiquidityStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { escapeRegExp, inputRegex } from '@/utils/escapeRegExp'
import { setStorageItem } from '@/utils/localStorage'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import { SettingField } from './SettingField'
import { SettingFieldToggleButton } from './SettingFieldToggleButton'

export const VerticalDivider = styled.span.withConfig({
  shouldForwardProp: (prop) => !['bg', 'height', 'width'].includes(prop)
})<{
  bg?: string
  height?: string
  width?: string
}>`
  background: ${colors.inputSecondary};
  width: ${({ width }) => width || '1px'};
  height: ${({ height }) => height || '20px'};
  margin: 0 4px;
`

export function SlippageToleranceSettingField({ variant = 'swap' }: { variant?: 'swap' | 'liquidity' }) {
  const { t } = useTranslation()
  const isSwap = variant === 'swap'
  const SLIPPAGE_KEY = isSwap ? SWAP_SLIPPAGE_KEY : LIQUIDITY_SLIPPAGE_KEY
  const swapSlippage = useSwapStore((s) => s.slippage)
  const liquiditySlippage = useLiquidityStore((s) => s.slippage)
  const slippage = isSwap ? swapSlippage : liquiditySlippage
  const isMobile = useAppStore((s) => s.isMobile)
  const [currentSlippage, setCurrentSlippage] = useState(new Decimal(slippage).mul(100).toFixed())
  const [isFirstFocused, setIsFirstFocused] = useState(false)
  const handleChange = useEvent((val: string) => {
    if (val === '' || inputRegex.test(escapeRegExp(val))) {
      setIsFirstFocused(!val)
      setCurrentSlippage(val)
    }
  })
  const handleUpdateSlippage = useEvent((val: string | number) => {
    const setVal = Number(val ?? 0) / 100
    setStorageItem(SLIPPAGE_KEY, setVal)
    if (isSwap) {
      useSwapStore.setState({ slippage: setVal }, false, { type: 'SlippageToleranceSettingField' })
    } else {
      useLiquidityStore.setState({ slippage: setVal }, false, { type: 'SlippageToleranceSettingField' })
    }
  })
  const handleBlur = useEvent(() => {
    setIsFirstFocused(false)
    if (!currentSlippage) handleChange('0')
    const value = Number(currentSlippage) > 50 ? 50 : currentSlippage
    if (Number(currentSlippage) > 50) {
      setCurrentSlippage('50')
    }
    handleUpdateSlippage(value || 0)
  })
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }, [])
  const handleFocus = useEvent(() => {
    setIsFirstFocused(true)
  })

  return (
    <SettingField
      fieldName={isSwap ? t('setting_board.slippage_tolerance_swap') : t('setting_board.slippage_tolerance_liquidity')}
      isCollapseDefaultOpen
      tooltip={isSwap ? t('setting_board.slippage_tolerance_tooltip_swap') : t('setting_board.slippage_tolerance_tooltip_liquidity')}
      renderToggleButton={
        isMobile
          ? (isOpen) => <SettingFieldToggleButton isOpen={isOpen} renderContent={`${new Decimal(slippage).mul(100).toFixed()}%`} />
          : null
      }
      renderWidgetContent={
        <>
          <Flex rowGap={2} flexWrap={['wrap', 'unset']} justifyContent="space-between">
            <Flex gap="2" alignItems="center">
              {(isSwap ? [0.1, 0.5, 1] : [1, 2.5, 3.5]).map((v) => (
                <Button
                  key={v}
                  scale="sm"
                  variant={new Decimal(slippage).mul(100).eq(v) ? 'primary' : 'tertiary'}
                  onClick={() => {
                    handleChange(String(v))
                    handleUpdateSlippage(v)
                  }}
                >
                  {formatToRawLocaleStr(toPercentString(v))}
                </Button>
              ))}
            </Flex>
            <Flex alignItems="center" rounded="full">
              <Text fontSize={14} mr="10px">
                {t('setting_board.custom')}
              </Text>
              <Flex alignItems="center">
                <Box position="relative" width="82px">
                  <Input
                    scale="md"
                    inputMode="decimal"
                    pattern="^[0-9]*[.,]?[0-9]{0,2}$"
                    value={isFirstFocused ? '' : currentSlippage}
                    placeholder={currentSlippage}
                    max={50}
                    // decimals={2}
                    onBlur={handleBlur}
                    onChange={(e) => handleChange(e.target.value.replace(/,/gi, '.'))}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    style={{ paddingRight: '30px' }}
                  />
                  <Flex position="absolute" right="8px" top="8px" alignItems="center">
                    <VerticalDivider />
                    <Text color="textSubtle">%</Text>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </Flex>
          {isSwap && new Decimal(currentSlippage || 0).gt('0.5') ? (
            <Box maxWidth="500px">
              <Message mt="2" variant="warning">
                <Text>{t('setting_board.slippage_tolerance_forerun')}</Text>
              </Message>
            </Box>
          ) : null}
        </>
      }
    />
  )
}
