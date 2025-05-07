import { SwapHorizIcon, WaterIcon } from '@pancakeswap/uikit'
import { Box, ColorMode, SimpleGrid, Text, VStack, useColorMode } from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import PortfolioPageThumbnailIcon from '@/icons/pageNavigation/PortfolioPageThumbnailIcon'
import { colors } from '@/theme/cssVariables'
import { shrinkToValue } from '@/utils/shrinkToValue'
import { PAGE_URLS } from '@/utils/config/routers'

/** only used is Mobile */
export function MobileBottomNavbar() {
  const { t } = useTranslation()
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const { pathname } = useRouter()
  const isSwapActive = pathname === PAGE_URLS.SWAP
  const isLiquidityActive = pathname === PAGE_URLS.LIQUIDITY
  const isPortfolioActive = pathname === PAGE_URLS.POSITIONS

  return (
    <SimpleGrid
      gridAutoFlow="column"
      gridAutoColumns="1fr"
      placeItems="center"
      height="54px"
      py={2}
      bg={colors.backgroundLight}
      borderTop={isLight ? `1px solid rgba(171, 196, 255, 0.2)` : `1px solid transparent`}
    >
      <BottomNavbarItem
        href={PAGE_URLS.SWAP}
        text={t('swap.title')}
        icon={() => <SwapHorizIcon color={isSwapActive ? colors.secondary : colors.textSubtle} />}
        isActive={isSwapActive}
      />
      <BottomNavbarItem
        href={PAGE_URLS.LIQUIDITY}
        text={t('liquidity.title')}
        icon={() => <WaterIcon color={isLiquidityActive ? colors.secondary : colors.textSubtle} />}
        isActive={isLiquidityActive}
      />
      <BottomNavbarItem
        href={PAGE_URLS.POSITIONS}
        text={t('portfolio.title')}
        icon={(colorMode) => <PortfolioPageThumbnailIcon colorMode={colorMode} isActive={isPortfolioActive} />}
        isActive={isPortfolioActive}
      />
    </SimpleGrid>
  )
}

function BottomNavbarItem({
  text,
  href,
  isActive,
  icon
}: {
  text: string
  href?: string
  isActive?: boolean
  icon?: ReactNode | ((colorMode: ColorMode) => ReactNode)
}) {
  const { colorMode } = useColorMode()
  const content = (
    <VStack spacing="2px">
      <Box>{shrinkToValue(icon, [colorMode])}</Box>
      <Text color={isActive ? colors.textSecondary : colors.textSubtle} fontSize="12px" lineHeight="12px" fontWeight={isActive ? 600 : 400}>
        {text}
      </Text>
    </VStack>
  )
  return href ? (
    <Link href={href}>
      <Box>{content}</Box>
    </Link>
  ) : (
    content
  )
}
