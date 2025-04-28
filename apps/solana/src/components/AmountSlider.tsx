import { Button, Slider } from '@pancakeswap/uikit'
import { Box, BoxProps, HStack, SliderFilledTrack, SliderThumb, SliderTrack, Text } from '@chakra-ui/react'
import { ReactNode, RefObject, useEffect, useState, useImperativeHandle } from 'react'
import { Menu } from 'react-feather'
import { useTranslation } from 'react-i18next'
import toPercentString from '@/utils/numberish/toPercentString'
import { colors } from '@/theme/cssVariables'
import { useSyncSignal } from '@/hooks/useSyncSignalState'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import PanelCard from './PanelCard'

export type AmountSliderProps = {
  percent?: number
  actionRef?: RefObject<{ changeValue: (val: number) => void }>

  // size?: 'sm' /* used in mobile */ | 'md' /** used in PC */

  /** see chakra's <Slider>'s prop:isDisabled */
  isDisabled?: boolean
  isRenderTopLeftLabel?: boolean
  renderTopLeftLabel?: () => ReactNode
  // renderTopLeftPercent?: () => ReactNode
  onChange?: (percent: number) => void
  // will change on progress, very frequently
  onHotChange?: (percent: number) => void
} & Omit<BoxProps, 'onChange'>

export default function AmountSlider({
  percent: inputPercent = 0,
  actionRef,
  isDisabled,
  isRenderTopLeftLabel = true,
  renderTopLeftLabel: _renderTopLeftLabel,
  onChange,
  onHotChange,
  ...restBoxProps
}: AmountSliderProps) {
  const { t } = useTranslation()
  const renderTopLeftLabel = _renderTopLeftLabel ?? (() => t('common.amount'))
  const sizes = {
    percentValueText: ['2xl', '3xl'],
    topLeftLabel: ['sm', 'md'],
    topLeftLabelAndPercentSpace: [2, 6],
    buttonSpace: [2, 4]
  }
  const btnStyle = {
    variant: 'primary60' as const,
    scale: 'xs' as const,
    borderRadius: '8px',
    disabled: isDisabled
  }
  const [percent, setPercent] = useSyncSignal({
    outsideValue: inputPercent ?? 0,
    onChange: (val) => {
      onChange?.(val)
    }
  })

  const [hotPercent, setHotPercent] = useState(percent)

  useEffect(() => {
    onHotChange?.(hotPercent)
  }, [hotPercent, onHotChange])

  useEffect(() => {
    setHotPercent?.(inputPercent)
  }, [inputPercent])

  useImperativeHandle(actionRef, () => ({
    changeValue: setHotPercent
  }))

  return (
    <PanelCard bg={colors.background} px="16px" py="12px" {...restBoxProps}>
      <HStack justify="space-between">
        <HStack spacing={sizes.topLeftLabelAndPercentSpace}>
          {isRenderTopLeftLabel && (
            <Text color={colors.textPrimary} fontSize={sizes.topLeftLabel}>
              {renderTopLeftLabel()}
            </Text>
          )}
          <Text color={colors.textPrimary} fontSize={sizes.percentValueText} fontWeight={500}>
            {toPercentString(hotPercent, { decimals: 0, alreadyPercented: true })}
          </Text>
        </HStack>

        <Desktop>
          <HStack spacing={sizes.buttonSpace}>
            <Button
              {...btnStyle}
              onClick={() => {
                setHotPercent(25)
                setPercent(25)
              }}
            >
              25%
            </Button>
            <Button
              {...btnStyle}
              onClick={() => {
                setHotPercent(50)
                setPercent(50)
              }}
            >
              50%
            </Button>
            <Button
              {...btnStyle}
              onClick={() => {
                setHotPercent(75)
                setPercent(75)
              }}
            >
              75%
            </Button>
            <Button
              {...btnStyle}
              onClick={() => {
                setHotPercent(100)
                setPercent(100)
              }}
            >
              100%
            </Button>
          </HStack>
        </Desktop>
      </HStack>
      {/* <Box paddingX={0}> */}
      <Box paddingX={3}>
        <Slider
          name="lp-amount"
          disabled={isDisabled}
          min={0}
          max={100}
          value={hotPercent}
          onValueChanged={(percent_) => {
            setHotPercent(percent_)
          }}
        />
      </Box>
      <Mobile>
        <HStack spacing={sizes.buttonSpace}>
          <Button
            {...btnStyle}
            onClick={() => {
              setHotPercent(25)
              setPercent(25)
            }}
          >
            25%
          </Button>
          <Button
            {...btnStyle}
            onClick={() => {
              setHotPercent(50)
              setPercent(50)
            }}
          >
            50%
          </Button>
          <Button
            {...btnStyle}
            onClick={() => {
              setHotPercent(75)
              setPercent(75)
            }}
          >
            75%
          </Button>
          <Button
            {...btnStyle}
            onClick={() => {
              setHotPercent(100)
              setPercent(100)
            }}
          >
            100%
          </Button>
        </HStack>
      </Mobile>
    </PanelCard>
  )
}
