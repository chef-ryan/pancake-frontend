import { useTranslation } from '@pancakeswap/localization'
import { Flex, Box, Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'

interface Props {
  currentPrice: string
  currentPriceLabel: string
  timePrice: string
  timeBase: string
}

export default function ChartPriceLabel({ currentPrice, currentPriceLabel, timePrice, timeBase }: Props) {
  const { t } = useTranslation()
  return (
    <Flex gap={[0, 2]} flexDirection="column" justifyContent="center">
      <Flex gap="2">
        <Flex flexDirection={['row', 'column']} gap={[2, 2]}>
          <Flex flexDirection="row" gap="4px" alignItems="center">
            <Box width="8px" height="8px" bg={colors.secondary} rounded="full" />
            <Text fontSize="xs" color={colors.textSubtle}>
              {t('Current Price')}
            </Text>
          </Flex>
          <Text fontSize="xs" fontWeight="600">
            {currentPrice}{' '}
            <Text as="span" color={colors.textSubtle} ml="5px">
              {currentPriceLabel}
            </Text>
          </Text>
        </Flex>
      </Flex>

      <Flex gap="2">
        <Flex flexDirection={['row', 'column']} gap={[2, 2]}>
          <Flex flexDirection="row" gap="4px" alignItems="center">
            <Box width="8px" height="8px" bg={colors.textSubtle} rounded="full" />
            <Text fontSize="xs" color={colors.textSubtle}>
              {t('%time% Price Range', {
                time: t(`clmm.timebasis_${timeBase}_label`)
              })}
            </Text>
          </Flex>
          <Text fontSize="xs" fontWeight="600">
            [{timePrice}]
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}
