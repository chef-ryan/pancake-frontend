import { useHttpLocations } from '@pancakeswap/hooks'
import { Currency, Token } from '@pancakeswap/sdk'
import { WrappedTokenInfo } from '@pancakeswap/token-lists'
import {
  ImageProps,
  TokenImage as UIKitTokenImage,
  TokenPairImage as UIKitTokenPairImage,
  TokenPairImageProps as UIKitTokenPairImageProps,
  TokenPairLogo as UIKitTokenPairLogo,
} from '@pancakeswap/uikit'
import { getTokenLogoURL } from '@pancakeswap/widgets-internal'
import { getBasicTokensImage } from 'components/Logo/CurrencyLogo'
import { ASSET_CDN } from 'config/constants/endpoints'
import { useMemo } from 'react'
import {
  getCurrencyLogoSrcs,
  getImageUrlFromToken,
  getImageUrlsFromToken,
  tokenImageChainNameMapping,
} from 'utils/tokenImages'

interface TokenPairImageProps extends Omit<UIKitTokenPairImageProps, 'primarySrc' | 'secondarySrc'> {
  primaryToken: Currency
  secondaryToken: Currency
  withChainLogo?: boolean
}

const useCurrencyLogoSrcs = (currency: Currency & { logoURI?: string | undefined }) => {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)
  const imageUrls = getImageUrlsFromToken(currency)
  const basicTokenImage = getBasicTokensImage(currency)

  return useMemo(() => {
    if (currency?.isNative) return []
    if (currency?.isToken) {
      const tokenLogoURL = getTokenLogoURL(currency as Token)
      if (currency instanceof WrappedTokenInfo) {
        if (!tokenLogoURL) return [...imageUrls, ...uriLocations, basicTokenImage]
        return [...imageUrls, ...uriLocations, tokenLogoURL, basicTokenImage]
      }
      if (!tokenLogoURL) return [...imageUrls, basicTokenImage]
      return [...imageUrls, tokenLogoURL, basicTokenImage]
    }
    return []
  }, [currency, uriLocations, imageUrls, basicTokenImage])
}

export const getChainLogoUrlFromChainId = (chainId: number) => `${ASSET_CDN}/web/chains/${chainId}.png`

export const TokenPairImage: React.FC<React.PropsWithChildren<TokenPairImageProps>> = ({
  primaryToken,
  secondaryToken,
  withChainLogo = false,
  ...props
}) => {
  const chainLogo = withChainLogo ? getChainLogoUrlFromChainId(primaryToken.chainId) : undefined
  return (
    <UIKitTokenPairImage
      primarySrc={getImageUrlFromToken(primaryToken)}
      secondarySrc={getImageUrlFromToken(secondaryToken)}
      chainLogoSrc={chainLogo}
      {...props}
    />
  )
}

export const TokenPairLogo: React.FC<React.PropsWithChildren<TokenPairImageProps>> = ({
  primaryToken,
  secondaryToken,
  withChainLogo = false,
  ...props
}) => {
  const chainLogo = useMemo(
    () => (withChainLogo ? [getChainLogoUrlFromChainId(primaryToken.chainId)] : []),
    [withChainLogo, primaryToken.chainId],
  )
  const primarySrcs = getCurrencyLogoSrcs(primaryToken as Currency & { logoURI?: string | undefined })
  const secondarySrcs = getCurrencyLogoSrcs(secondaryToken as Currency & { logoURI?: string | undefined })
  return (
    <UIKitTokenPairLogo primarySrcs={primarySrcs} secondarySrcs={secondarySrcs} chainLogoSrcs={chainLogo} {...props} />
  )
}

interface TokenImageProps extends ImageProps {
  token: Token
}

export const TokenImage: React.FC<React.PropsWithChildren<TokenImageProps>> = ({ token, ...props }) => {
  return <UIKitTokenImage src={getImageUrlFromToken(token)} {...props} />
}

export { getCurrencyLogoSrcs, getImageUrlFromToken, getImageUrlsFromToken, tokenImageChainNameMapping }
