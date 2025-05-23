import { ResetCSS } from '@pancakeswap/uikit'
import Decimal from 'decimal.js'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import '@/components/LandingPage/components/tvl.css'
import '@/components/LandingPage/liquidity.css'
import '@/components/Toast/toast.css'
import { GoogleAnalytics } from '@next/third-parties/google'
import { DefaultSeo } from 'next-seo'
import { SEO } from 'next-seo.config'
import 'react-day-picker/dist/style.css'
import { Providers } from '@/provider'
import Content from '@/components/Content'
import AppNavLayout from '@/components/AppLayout/AppNavLayout'
import useThemeSync from '@/hooks/useThemeSync'

// const DynamicProviders = dynamic(() => import('@/provider').then((mod) => mod.Providers), { ssr: false })
// const DynamicContent = dynamic(() => import('@/components/Content'))
// const DynamicAppNavLayout = dynamic(() => import('@/components/AppLayout/AppNavLayout'), { ssr: false })

const CONTENT_ONLY_PATH = ['/', '404', '/moonpay']
const OVERFLOW_HIDDEN_PATH = ['/liquidity-pools', '/swap']
const FULL_SIZE_PATH = ['/swap']

Decimal.set({ precision: 1e3 })

const GlobalHooks = () => {
  useThemeSync()
  return null
}

const MyApp = ({ Component, pageProps, ...props }: AppProps) => {
  const { pathname } = useRouter()

  const [onlyContent, overflowHidden, fullSize] = useMemo(
    () => [CONTENT_ONLY_PATH.includes(pathname), OVERFLOW_HIDDEN_PATH.includes(pathname), FULL_SIZE_PATH.includes(pathname)],
    [pathname]
  )

  return (
    <>
      <GoogleAnalytics gaId="G-DR3V6FTKE3" />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>{pageProps?.title ? `${pageProps.title} PancakeSwap` : 'PancakeSwap'}</title>
      </Head>
      <DefaultSeo {...SEO} />
      <Providers>
        <Content {...props}>
          <ResetCSS />
          <GlobalHooks />
          {onlyContent ? (
            <Component {...pageProps} />
          ) : (
            <AppNavLayout overflowHidden={overflowHidden} fullSize={fullSize}>
              <Component {...pageProps} />
            </AppNavLayout>
          )}
        </Content>
      </Providers>
    </>
  )
}

export default MyApp
