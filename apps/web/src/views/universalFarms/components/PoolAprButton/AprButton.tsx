import { FlexGap, Skeleton, Text, TooltipText } from '@pancakeswap/uikit'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { FarmWidget } from '@pancakeswap/widgets-internal'
import { forwardRef, MouseEvent, useCallback, useMemo } from 'react'

type ApyButtonProps = {
  showApyButton?: boolean
  loading?: boolean
  onClick?: () => void
  hasFarm?: boolean
  onAPRTextClick?: () => void
  baseApr?: number
  fontSize?: string
}

export const AprButton = forwardRef<HTMLElement, ApyButtonProps>(
  ({ showApyButton = true, loading, onClick, onAPRTextClick, baseApr, hasFarm, fontSize }, ref) => {
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
        <AprButtonText hasFarm={hasFarm} baseApr={baseApr} ref={ref} onClick={onAPRTextClick} fontSize={fontSize} />
      </FlexGap>
    )
  },
)

type AprButtonTextProps = Pick<ApyButtonProps, 'baseApr' | 'hasFarm' | 'fontSize'> & {
  onClick?: () => void
}

const AprButtonText = forwardRef<HTMLElement, AprButtonTextProps>(
  ({ baseApr, hasFarm, onClick, fontSize = '16px' }, ref) => {
    const isZeroApr = baseApr === 0

    const ZeroApr = useMemo(
      () => (
        <TooltipText ml="4px" fontSize={fontSize} color="destructive" bold>
          0%
        </TooltipText>
      ),
      [],
    )

    const commonApr = useMemo(
      () => (
        <FlexGap>
          {hasFarm ? (
            <Text fontSize={fontSize} color="v2Primary50" bold>
              🌿
            </Text>
          ) : null}
          <TooltipText ml="4px" fontSize={fontSize} color="text">
            {baseApr ? displayApr(baseApr) : null}
          </TooltipText>
        </FlexGap>
      ),
      [baseApr, hasFarm],
    )

    if (typeof baseApr === 'undefined') {
      return null
    }
    return (
      <span ref={ref} onClick={onClick} aria-hidden>
        {isZeroApr ? ZeroApr : commonApr}
      </span>
    )
  },
)
