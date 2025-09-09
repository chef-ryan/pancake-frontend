import { usePreviousValue, useTheme } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  BoxProps,
  ButtonMenu,
  ButtonMenuItem,
  Card,
  Text,
  FlexGap,
  PreTitle,
  QuestionHelper,
  useMatchBreakpoints,
  DropdownMenu,
  Flex,
  ArrowDropDownIcon,
} from '@pancakeswap/uikit'
import MenuItem from '@pancakeswap/uikit/components/MenuItem/MenuItem'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFeeLevelQueryState } from 'state/infinity/create'
import { useActiveChainId } from 'hooks/useAccountActiveChain'
import { NonEVMChainId } from '@pancakeswap/chains'
import { useSolanaClmmFeeTiers } from 'hooks/solana/useSolanaClmmFeeTiers'
import { useSolanaExistingFeeTiers } from 'hooks/solana/useSolanaExistingFeeTiers'
import { useCurrencies } from '../../hooks/useCurrencies'

import { PRESET_FEE_LEVELS_V3 } from '../../constants'

export type FieldFeeLevelProps = BoxProps

const decimals = 4

export const FieldFeeLevel: React.FC<FieldFeeLevelProps> = ({ ...boxProps }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const { theme } = useTheme()
  const [feeLevel, setFeeLevel] = useFeeLevelQueryState()
  const [inputValue, setInputValue] = useState<string | null>(null)
  const { chainId } = useActiveChainId()
  const solanaFeeTiers = useSolanaClmmFeeTiers()
  const { baseCurrency, quoteCurrency } = useCurrencies()

  // Fetch existing Solana pools for the selected pair to disable used fee tiers
  const { data: existingSolanaFeeTiers } = useSolanaExistingFeeTiers(
    baseCurrency?.wrapped.address,
    quoteCurrency?.wrapped.address,
    chainId === NonEVMChainId.SOLANA,
  )

  // Build dynamic options depending on chain
  const options = useMemo(() => {
    if (chainId === NonEVMChainId.SOLANA) {
      return solanaFeeTiers
    }
    return PRESET_FEE_LEVELS_V3
  }, [chainId, solanaFeeTiers])

  // Compute disabled tiers if existing pools are present for the selected pair
  const disabledSet = useMemo(() => {
    if (chainId !== NonEVMChainId.SOLANA) return new Set<number>()
    return existingSolanaFeeTiers ?? new Set<number>()
  }, [chainId, existingSolanaFeeTiers])

  const handleQuickSelect = useCallback(
    (presetFeeLevel: number) => {
      setFeeLevel(presetFeeLevel)
      setInputValue(presetFeeLevel.toString())
    },
    [setFeeLevel],
  )

  const handleMenuItemClick = useCallback(
    (index: number) => {
      if (index < options.length) {
        const tier = options[index]
        if (disabledSet.has(tier)) return
        handleQuickSelect(options[index])
      }
    },
    [handleQuickSelect, options, disabledSet],
  )

  const activeIndex = useMemo(() => {
    const presetIndex = options.findIndex((preset) => preset === feeLevel)
    return presetIndex
  }, [feeLevel, options])

  const prevFeeLevel = usePreviousValue(feeLevel)

  useEffect(() => {
    if (inputValue === null && feeLevel !== null) {
      setInputValue(parseFloat(feeLevel.toFixed(decimals)).toString())
    }
  }, [feeLevel, inputValue])

  useEffect(() => {
    if (prevFeeLevel !== null && feeLevel === null) {
      setInputValue(null)
    }
  }, [feeLevel, prevFeeLevel])

  // Auto-select a default Solana fee tier when none selected or current is disabled
  useEffect(() => {
    if (chainId !== NonEVMChainId.SOLANA) return
    if (!options.length) return
    const current = feeLevel ?? undefined
    if (current && !disabledSet.has(current)) return
    // Prefer 0.25% if available and not disabled, else first available
    const preferred = 0.25
    const candidate = options.find((v) => v === preferred && !disabledSet.has(v))
    const firstAvailable = candidate ?? options.find((v) => !disabledSet.has(v))
    if (firstAvailable !== undefined) {
      setFeeLevel(firstAvailable)
      setInputValue(firstAvailable.toString())
    }
  }, [chainId, options, disabledSet, feeLevel, setFeeLevel])

  const renderSolanaDropdown = () => {
    return (
      <Card>
        <Flex p="16px" flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text>{t('Pick a fee tier')}</Text>
          <DropdownMenu
            items={options.map((o, idx) => ({
              label: o.toString(),
              value: o,
              disabled: disabledSet.has(o),
              onClick: (e) => {
                e.preventDefault()
                handleMenuItemClick(idx)
              },
            }))}
          >
            <MenuItem hoverColor="white">
              <Flex
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                width="148px"
                borderRadius="8px"
                border={`1px solid ${theme.colors.cardBorder}`}
                p="8px"
              >
                <Text lineHeight="1.2">{feeLevel ?? ''}</Text>
                <ArrowDropDownIcon color="text" />
              </Flex>
            </MenuItem>
          </DropdownMenu>
        </Flex>
      </Card>
    )
  }

  return (
    <Box {...boxProps}>
      <FlexGap gap="4px">
        <PreTitle mb="8px">{t('Fee Level')}</PreTitle>
        <QuestionHelper
          placement="auto"
          mb="8px"
          color="secondary"
          text={t('Common range: 0.01% to 0.3%, Ideal range <1%')}
        />
      </FlexGap>

      {chainId === NonEVMChainId.SOLANA ? (
        renderSolanaDropdown()
      ) : (
        <ButtonMenu
          activeIndex={activeIndex}
          onItemClick={handleMenuItemClick}
          variant="subtle"
          fullWidth={!isMobile}
          scale={isMobile ? 'sm' : 'md'}
        >
          {options.map((opt) => (
            <ButtonMenuItem key={opt} padding={isMobile ? '0 8px' : '0 16px'}>
              {opt}%
            </ButtonMenuItem>
          ))}
        </ButtonMenu>
      )}
    </Box>
  )
}
