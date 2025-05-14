import { tokens } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import React, { useEffect, useRef } from 'react'
import { styled } from 'styled-components'
import type { TradingViewWidget, TradingViewWidgetOptions } from './lib/pancakeswap-charting-library.d.ts'
import { createTradingViewWidget, loadTradingViewLibrary } from './lib/pancakeswap-charting-library.es.js'

interface TradingViewChartProps {
  symbol?: string
  interval?: string
  theme?: 'Light' | 'Dark'
  height?: string
  width?: string
}

const ChartContainer = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  ${({ theme }) => theme.mediaQueries.md} {
    padding-top: 0;
    width: 100%;
    height: 495px;
  }
`

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol = 'AAPL' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<TradingViewWidget | null>(null)
  const isInitialized = useRef(false)
  const { isDark, theme } = useTheme()

  useEffect(() => {
    async function initChart() {
      try {
        await loadTradingViewLibrary()

        if (containerRef.current && !widgetRef.current && !isInitialized.current) {
          const options: TradingViewWidgetOptions = {
            symbol,
            theme: isDark ? 'Dark' : 'Light',
            overrides: {
              'mainSeriesProperties.candleStyle.upColor': isDark
                ? tokens.colors.dark.success
                : tokens.colors.light.success,
              'mainSeriesProperties.candleStyle.downColor': isDark
                ? tokens.colors.dark.destructive
                : tokens.colors.light.destructive,
              'mainSeriesProperties.candleStyle.borderUpColor': isDark
                ? tokens.colors.dark.success
                : tokens.colors.light.success,
              'mainSeriesProperties.candleStyle.borderDownColor': isDark
                ? tokens.colors.dark.destructive
                : tokens.colors.light.destructive,
              'mainSeriesProperties.candleStyle.wickUpColor': isDark
                ? tokens.colors.dark.success
                : tokens.colors.light.success,
              'mainSeriesProperties.candleStyle.wickDownColor': isDark
                ? tokens.colors.dark.destructive
                : tokens.colors.light.destructive,
              'paneProperties.background': isDark ? tokens.colors.dark.card : tokens.colors.light.card,
              'paneProperties.backgroundType': 'solid',
              'paneProperties.grid.color': isDark ? '#ffffff' : tokens.colors.light.cardBorder,
              'paneProperties.grid.style': 0,
              'paneProperties.vertGrid.color': isDark ? '#ffffff' : tokens.colors.light.cardBorder,
              'paneProperties.vertGrid.style': 0,
              'paneProperties.horzGrid.color': isDark ? '#ffffff' : tokens.colors.light.cardBorder,
              'paneProperties.horzGrid.style': 0,
              headerToolbarBg: isDark ? tokens.colors.dark.backgroundAlt : tokens.colors.light.backgroundAlt,
            },
            disabled_features: [
              'left_toolbar',
              // 'header_widget',
              'symbol_info',
              'header_symbol_search',
              'create_volume_indicator_by_default',
              'create_volume_indicator_by_default_once',
              'volume_force_overlay',
              'symbol_info_price_source',
              'allow_arbitrary_symbol_search_input',
              'symbol_search_hot_key',
              'header_compare',
              'compare_symbol_search_spread_operators',
              'studies_symbol_search_spread_operators',
              'symbol_info_long_description',
              'show_symbol_logos',
              'show_symbol_logo_in_legend',
              'show_symbol_logo_for_compare_studies',
              'uppercase_instrument_names',
              'study_symbol_ticker_description',
              'auto_enable_symbol_labels',
              // 禁用圖表上的標記 (earnings, dividends 等)
              'marks_on_bars',
              'show_event_marks',
              'show_earnings_marks',
              'show_dividend_marks',
              'show_splits_marks',
              // 禁用時間軸上的標記
              'timescale_marks',
              'timeframes_toolbar',
              'legend_widget',
              'display_legend_on_all_charts',
              'two_character_bar_marks_labels',
            ],
            enabled_features: ['hide_left_toolbar_by_default'],
            autosize: true,
            height: '100%',
            width: '100%',
          }

          widgetRef.current = createTradingViewWidget(containerRef.current, options)
          isInitialized.current = true
        }
      } catch (error) {
        console.error('Failed to initialize chart:', error)
      }
    }

    initChart()
  }, [symbol, isDark, theme])

  useEffect(() => {
    console.log('isDark', isDark, widgetRef.current && isInitialized.current)
    async function changeTheme() {
      if (widgetRef.current && isInitialized.current) {
        await widgetRef.current.changeTheme(isDark ? 'Dark' : 'Light')
        widgetRef.current.applyOverrides({
          'mainSeriesProperties.candleStyle.upColor': isDark ? tokens.colors.dark.success : tokens.colors.light.success,
          'mainSeriesProperties.candleStyle.downColor': isDark
            ? tokens.colors.dark.destructive
            : tokens.colors.light.destructive,
          'mainSeriesProperties.candleStyle.borderUpColor': isDark
            ? tokens.colors.dark.success
            : tokens.colors.light.success,
          'mainSeriesProperties.candleStyle.borderDownColor': isDark
            ? tokens.colors.dark.destructive
            : tokens.colors.light.destructive,
          'mainSeriesProperties.candleStyle.wickUpColor': isDark
            ? tokens.colors.dark.success
            : tokens.colors.light.success,
          'mainSeriesProperties.candleStyle.wickDownColor': isDark
            ? tokens.colors.dark.destructive
            : tokens.colors.light.destructive,
          'paneProperties.background': isDark ? tokens.colors.dark.card : tokens.colors.light.card,
          'paneProperties.backgroundType': 'solid',
          'paneProperties.grid.color': isDark ? '#ffffff' : tokens.colors.light.cardBorder,
          'paneProperties.grid.style': 0,
          'paneProperties.vertGrid.color': isDark ? '#ffffff' : tokens.colors.light.cardBorder,
          'paneProperties.vertGrid.style': 0,
          'paneProperties.horzGrid.color': isDark ? '#ffffff' : tokens.colors.light.cardBorder,
          'paneProperties.horzGrid.style': 0,
        })
      }
    }
    changeTheme()
  }, [isDark, theme])

  useEffect(() => {
    return () => {
      if (widgetRef.current?.remove) {
        widgetRef.current.remove()
      }
      widgetRef.current = null
    }
  }, [])

  return <ChartContainer id="swap-chart" ref={containerRef} />
}

export default TradingViewChart
