import React, { useEffect, useRef } from 'react'
import type { TradingViewWidget, TradingViewWidgetOptions } from './lib/pancakeswap-charting-library.d.ts'
import { createTradingViewWidget, loadTradingViewLibrary } from './lib/pancakeswap-charting-library.es.js'

interface TradingViewChartProps {
  symbol?: string
  interval?: string
  theme?: 'Light' | 'Dark'
  height?: string
  width?: string
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol = 'AAPL', theme = 'Dark', height = '600px' }) => {
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
              'header_widget',
              'timeframes_toolbar',
              'edit_buttons_in_legend',
              'context_menus',
              'control_bar',
            ],
            enabled_features: ['hide_left_toolbar_by_default'],
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

  return <div id="swap-chart" ref={containerRef} style={{ height }} />
}

export default TradingViewChart
