import { Card } from '@pancakeswap/uikit'
import { Box, HStack, Image, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import { colors } from '@/theme/cssVariables'
import { appLayoutPaddingX } from '@/theme/detailConfig'
import { formatCurrency } from '@/utils/numberish/formatter'

export default function TVLInfoPanel({ tvl, volume }: { tvl: string | number; volume: string | number }) {
  const { t } = useTranslation()
  return (
    <HStack spacing={5}>
      <TVLInfoItem name={t('common.tvl')} value={tvl} decoratorImageSrc="/images/tvl-lock.svg" />
      <TVLInfoItem name={t('common.24h_volume')} value={volume} decoratorImageSrc="/images/volume-total.svg" />
    </HStack>
  )
}

function TVLInfoItem({ name, value }: { name: string; value: string | number; decoratorImageSrc?: string }) {
  return (
    <Card>
      <Box px={3} py={2}>
        <Text fontSize="xs" color={colors.textSubtle}>
          {name}
        </Text>
        <Text fontSize="24px" fontWeight={600} color={colors.textPrimary}>
          {formatCurrency(value, { symbol: '$', decimalPlaces: 2 })}
        </Text>
      </Box>
    </Card>
  )
}

export function TVLInfoPanelMobile({ tvl, volume }: { tvl: string | number; volume: string | number }) {
  const { t } = useTranslation()
  return (
    <HStack
      justifyContent="space-between"
      background={colors.backgroundLight}
      py={2}
      color={colors.textPrimary}
      px={appLayoutPaddingX}
      lineHeight={1}
      fontWeight={600}
    >
      <HStack>
        <Text color={colors.textSubtle} fontSize="xs">
          {t('common.tvl')}
        </Text>
        <Text fontSize="md" fontWeight={600}>
          {formatCurrency(tvl, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
        </Text>
      </HStack>

      <HStack>
        <Text color={colors.textSubtle} fontSize="xs" fontWeight={400}>
          {t('common.vol_24h')}
        </Text>
        <Text fontSize="md" fontWeight={600}>
          {formatCurrency(volume, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
        </Text>
      </HStack>
    </HStack>
  )
}
