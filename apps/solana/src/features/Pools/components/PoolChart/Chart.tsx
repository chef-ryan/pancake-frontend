import { AbsoluteCenter, Box, Center, HStack, Spinner, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { panelCard } from '@/theme/cssBlocks'

import ChartTooltip from './ChartTooltip'

export default function Chart<T = any>({
  currentCategoryLabel,
  data,
  isEmpty,
  isActionRunning,
  xKey,
  yKey,
  renderTimeTypeTabs,
  renderTabs
}: {
  currentCategoryLabel: string
  data: T[]
  isEmpty?: boolean
  isActionRunning?: boolean
  xKey: string | ((utils: { category: T }) => string)
  yKey: string | ((utils: { category: T }) => string)
  renderTimeTypeTabs: ReactNode
  renderTabs?: ReactNode
}) {
  const { t } = useTranslation()
  const isMobile = useAppStore((s) => s.isMobile)
  return (
    <Box>
      {renderTabs && !isMobile && <Box mb={2}>{renderTabs}</Box>}
      <Box {...panelCard} bg={colors.background} mt={[0, '6']} px={['4', '6']} py="4">
        <HStack mb={['8px', '20px']} justify="center">
          <Box>{isMobile && renderTabs}</Box>
          <Box>{renderTimeTypeTabs}</Box>
        </HStack>

        <Center>
          {isActionRunning && (
            <AbsoluteCenter>
              <Spinner color={colors.textSecondary} />
            </AbsoluteCenter>
          )}

          {isEmpty && !isActionRunning && (
            <AbsoluteCenter>
              <Box fontSize="xs" color={colors.textTertiary} whiteSpace="nowrap" textAlign="center">
                <Text mb={2}>{t('error.no_chart_data')}</Text>
                <Text>{t('error.no_chart_data_hint')}</Text>
              </Box>
            </AbsoluteCenter>
          )}
          <Box opacity={isEmpty ? 0 : 1} width="100%">
            <ResponsiveContainer width="100%" height={isMobile ? 100 : 250}>
              <BarChart data={data}>
                <CartesianGrid vertical={false} opacity={0.1} />
                {data.length > 0 && (
                  <XAxis
                    fontSize="10px"
                    stroke={colors.textTertiary}
                    dataKey={xKey}
                    tickMargin={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(d) => {
                      const tempDate = new Date(d)
                      return `${(tempDate.getMonth() + 1).toString()}/${tempDate.getDate().toString()}`
                    }}
                  />
                )}
                {/* <YAxis tickFormatter={yTickformats} /> */}
                <Bar dataKey={yKey} fill={colors.primary} radius={200} maxBarSize={7} />
                <Tooltip content={<ChartTooltip category={currentCategoryLabel} />} cursor={{ fill: 'transparent' }} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Center>
      </Box>
    </Box>
  )
}
