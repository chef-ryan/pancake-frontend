import { useHttpLocations } from '@pancakeswap/hooks'
import { TokenLogo } from '@pancakeswap/uikit'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import { space, SpaceProps } from 'styled-system'

import { CurrencyInfo } from './types'

const StyledLogo = styled(TokenLogo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
  ${space}
`

export function CurrencyLogo({
  currency,
  size = '24px',
  style,
  imageRef,
  ...props
}: {
  currency?: CurrencyInfo & {
    logoURI?: string | undefined
  }
  size?: string
  style?: React.CSSProperties
  imageRef?: React.RefObject<HTMLImageElement>
} & SpaceProps) {
  const uriLocations = useHttpLocations(currency?.logoURI)

  const srcs: string[] = useMemo(() => {
    if (currency?.isNative) return []

    if (currency?.isToken) {
      const logoUrls = []

      if (currency?.logoURI) {
        return [...uriLocations, ...logoUrls]
      }
      return [...logoUrls]
    }
    return []
  }, [currency, uriLocations])

  if (currency?.isNative) {
    return (
      <StyledLogo
        size={size}
        srcs={[`https://assets.pancakeswap.finance/web/native/${currency.chainId}.png`]}
        width={size}
        imageRef={imageRef}
        style={style}
        {...props}
      />
    )
  }

  return (
    <StyledLogo
      imageRef={imageRef}
      size={size}
      srcs={srcs}
      alt={`${currency?.symbol ?? 'token'} logo`}
      style={style}
      {...props}
    />
  )
}
