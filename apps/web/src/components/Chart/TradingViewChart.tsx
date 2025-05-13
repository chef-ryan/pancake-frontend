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
  const { isDark, theme } = useTheme()

  useEffect(() => {
    let isMounted = true

    async function initChart() {
      try {
        await loadTradingViewLibrary()

        if (containerRef.current && !widgetRef.current && isMounted && theme.colors) {
          const options: TradingViewWidgetOptions = {
            symbol,
            theme: isDark ? 'Dark' : 'Light',
            supports_marks_on_bars: false,
            supports_timescale_marks: false,
            overrides: {
              'mainSeriesProperties.candleStyle.upColor': theme.colors.primary,
              'mainSeriesProperties.candleStyle.downColor': theme.colors.failure,
              'mainSeriesProperties.candleStyle.borderUpColor': theme.colors.primary,
              'mainSeriesProperties.candleStyle.borderDownColor': theme.colors.failure,
              'mainSeriesProperties.candleStyle.wickUpColor': theme.colors.primary,
              'mainSeriesProperties.candleStyle.wickDownColor': theme.colors.failure,
              'paneProperties.background': theme.colors.backgroundAlt,
              'paneProperties.backgroundType': 'solid',
              headerToolbarBg: theme.colors.backgroundAlt,
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
            enabled_features: [
              'hide_left_toolbar_by_default',
              'use_localstorage_for_settings',
              'save_chart_properties_to_local_storage',
            ],
            autosize: true,
            height: '100%',
            width: '100%',
          }

          widgetRef.current = createTradingViewWidget(containerRef.current, options)
        }
      } catch (error) {
        console.error('Failed to initialize chart:', error)
      }
    }

    initChart()

    return () => {
      isMounted = false
      if (widgetRef.current?.remove) {
        widgetRef.current.remove()
      }
      widgetRef.current = null
    }
  }, [symbol, theme])

  return <ChartContainer id="swap-chart" ref={containerRef} />
}

export default TradingViewChart
