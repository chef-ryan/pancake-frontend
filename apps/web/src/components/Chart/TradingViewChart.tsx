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
  padding-top: 70px;
  width: 100%;
  height: 100%;
  ${({ theme }) => theme.mediaQueries.md} {
    padding-top: 0;
    width: 100%;
  }
`

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol = 'AAPL', theme = 'Dark' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<TradingViewWidget | null>(null)

  useEffect(() => {
    let isMounted = true

    async function initChart() {
      try {
        await loadTradingViewLibrary()

        if (containerRef.current && !widgetRef.current && isMounted) {
          const options: TradingViewWidgetOptions = {
            symbol,
            theme,
            disabled_features: [
              'left_toolbar',
              // 'header_widget',
              // 'timeframes_toolbar',
              // 'edit_buttons_in_legend',
              // 'context_menus',
              // 'control_bar',
              // 'border_around_the_chart',
              // 'main_series_scale_menu',
              // 'legend_context_menu',
              // 'scales_context_menu',
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
