import { SwapHorizIcon, WaterIcon } from '@pancakeswap/uikit'
import { Box, ColorMode, SimpleGrid, Text, VStack, useColorMode } from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import { useTranslation } from '@pancakeswap/localization'

import PortfolioPageThumbnailIcon from '@/icons/pageNavigation/PortfolioPageThumbnailIcon'
import { colors } from '@/theme/cssVariables'
import { shrinkToValue } from '@/utils/shrinkToValue'
import { pageRoutePathnames } from '@/utils/config/routers'

/** only used is Mobile */
export function MobileBottomNavbar() {
  const { t } = useTranslation()
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const { pathname } = useRouter()
  const isSwapActive = pathname === pageRoutePathnames.swap
  const isLiquidityActive = pathname === pageRoutePathnames.pools
  const isPortfolioActive = pathname === pageRoutePathnames.portfolio

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
        href={pageRoutePathnames.swap}
        text={t('Swap')}
        icon={() => <SwapHorizIcon color={isSwapActive ? colors.secondary : colors.textSubtle} />}
        isActive={isSwapActive}
      />
      <BottomNavbarItem
        href={pageRoutePathnames.pools}
        text={t('Liquidity')}
        icon={() => <WaterIcon color={isLiquidityActive ? colors.secondary : colors.textSubtle} />}
        isActive={isLiquidityActive}
      />
      <BottomNavbarItem
        href={pageRoutePathnames.portfolio}
        text={t('My Positions')}
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
