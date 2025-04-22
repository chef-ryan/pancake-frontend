import { Box, Flex } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import SortUpDownArrow from '@/components/SortUpDownArrow'
import { colors } from '@/theme/cssVariables'
import { poolListGrid } from '../cssBlocks'
import { TimeBase, POOL_SORT_KEY } from '../util'
import { Desktop, Mobile } from '@/components/MobileDesktop'

export function PoolListHeader({
  sortKey,
  order,
  timeBase,
  handleClickSort
}: {
  sortKey: string
  order: number
  handleClickSort: (key: string) => void
  timeBase: TimeBase
}) {
  const { t } = useTranslation()

  return (
    <Flex
      w="100%"
      alignItems="center"
      backgroundColor={colors.cardBg}
      border={`1px solid ${colors.cardBorder01}`}
      borderBottom="none"
      borderRadius="24px 24px 0 0"
      color={colors.textSecondary}
      fontWeight={600}
      textTransform="uppercase"
      px="24px"
      py="12px"
      whiteSpace="nowrap"
      sx={poolListGrid}
      fontSize="12px"
    >
      <Box pl={[0, 4 + 6]}>{t('liquidity.pool')}</Box>
      <Desktop>
        <Flex
          justifyContent="end"
          alignItems="center"
          gap="1"
          cursor="pointer"
          onClick={() => handleClickSort('liquidity')}
          justify="flex-start"
          pr="30px"
        >
          {t('liquidity.title')}
          {sortKey === POOL_SORT_KEY.liquidity ? <SortUpDownArrow width="12px" height="12px" isDown={Boolean(order)} /> : null}
        </Flex>
        <Flex justifyContent="end" alignItems="center" gap="1" cursor="pointer" onClick={() => handleClickSort('volume')}>
          {t(`field.${timeBase}_volume`)}
          {sortKey === POOL_SORT_KEY.volume ? <SortUpDownArrow width="12px" height="12px" isDown={Boolean(order)} /> : null}
        </Flex>
        <Flex justifyContent="end" alignItems="center" gap="1" cursor="pointer" onClick={() => handleClickSort('fee')}>
          {t(`field.${timeBase}_fees`)}
          {sortKey === POOL_SORT_KEY.fee ? <SortUpDownArrow width="12px" height="12px" isDown={Boolean(order)} /> : null}
        </Flex>
        <Flex justifyContent="end" alignItems="center" gap="1" cursor="pointer" onClick={() => handleClickSort('apr')}>
          {t(`field.${timeBase}_apr`)}
          {sortKey === POOL_SORT_KEY.apr ? <SortUpDownArrow width="12px" height="12px" isDown={Boolean(order)} /> : null}
        </Flex>
      </Desktop>
      <Mobile>
        <Flex alignItems="center" gap="1" cursor="pointer" onClick={() => handleClickSort('volume')}>
          {t('common.volume')}/{t(`field.${timeBase}_apr`)}
          {sortKey === POOL_SORT_KEY.volume ? <SortUpDownArrow width="12px" height="12px" isDown={Boolean(order)} /> : null}
        </Flex>
      </Mobile>
      <Box />
    </Flex>
  )
}
