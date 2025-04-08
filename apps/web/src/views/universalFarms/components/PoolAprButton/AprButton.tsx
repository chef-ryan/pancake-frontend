import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, Skeleton, Text, TooltipText, useMatchBreakpoints } from '@pancakeswap/uikit'
import { FarmWidget } from '@pancakeswap/widgets-internal'
import { forwardRef, MouseEvent, useCallback, useMemo } from 'react'
import { displayApr } from '@pancakeswap/utils/displayApr'

type ApyButtonProps = {
  showApyButton?: boolean
  loading?: boolean
  onClick?: () => void
  onAPRTextClick?: () => void
  baseApr?: number
  boostApr?: number
}

export const AprButton = forwardRef<HTMLElement, ApyButtonProps>(
  ({ showApyButton = true, loading, onClick, onAPRTextClick, baseApr, boostApr }, ref) => {
    const handleClick = useCallback(
      (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (onClick) {
          onClick()
        }
      },
      [onClick],
    )

    if (loading) {
      return <Skeleton height={24} width={80} style={{ borderRadius: '12px' }} />
    }

    return (
      <FlexGap alignItems="center">
        {showApyButton && <FarmWidget.FarmApyButton variant="text-and-button" handleClickButton={handleClick} />}
        <AprButtonText baseApr={baseApr} boostApr={boostApr} ref={ref} onClick={onAPRTextClick} />
      </FlexGap>
    )
  },
)

type AprButtonTextProps = Pick<ApyButtonProps, 'baseApr' | 'boostApr'> & {
  onClick?: () => void
}

const AprButtonText = forwardRef<HTMLElement, AprButtonTextProps>(({ baseApr, boostApr, onClick }, ref) => {
  const { t } = useTranslation()
  const isZeroApr = baseApr === 0
  const hasBoost = boostApr && boostApr > 0
  const { isDesktop } = useMatchBreakpoints()

  const ZeroApr = useMemo(
    () => (
      <TooltipText ml="4px" fontSize="16px" color="destructive" bold>
        0%
      </TooltipText>
    ),
    [],
  )

  const [BoostText, baseAprText] = useMemo(
    () => [
      <>
        <Text fontSize="16px" color="v2Primary50" bold>
          🌿 {t('Up to')}
        </Text>
        <TooltipText fontSize="16px" color="v2Primary50" bold decorationColor="secondary">
          {boostApr ? displayApr(boostApr) : null}
        </TooltipText>
      </>,
      <>
        <TooltipText decorationColor="secondary">
          <Text style={{ textDecoration: 'line-through' }}>{baseApr ? displayApr(baseApr) : null}</Text>
        </TooltipText>
      </>,
    ],
    [boostApr, baseApr, t],
  )

  const BoostApr = useMemo(
    () =>
      isDesktop ? (
        <>
          <FlexGap ml="4px" mr="5px" gap="4px">
            {BoostText}
          </FlexGap>
          <FlexGap ml="4px" mr="5px" gap="4px">
            {baseAprText}
          </FlexGap>
        </>
      ) : (
        <FlexGap ml="4px" mr="5px" gap="4px">
          {BoostText}
          {baseAprText}
        </FlexGap>
      ),
    [BoostText, baseAprText, isDesktop],
  )

  const commonApr = useMemo(
    () => (
      <TooltipText ml="4px" fontSize="16px" color="text">
        {baseApr ? displayApr(baseApr) : null}
      </TooltipText>
    ),
    [baseApr],
  )

  if (typeof baseApr === 'undefined') {
    return null
  }
  return (
    <span ref={ref} onClick={onClick} aria-hidden>
      {isZeroApr ? ZeroApr : hasBoost ? BoostApr : commonApr}
    </span>
  )
})
