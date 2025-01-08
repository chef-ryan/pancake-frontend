import { FloatingNavigation } from 'components/FloatingNavigation'
import { Providers } from 'components/Providers'
import type { AppProps } from 'next/app'
import '../styles/globals.css' // Import global CSS

const MyApp = ({ Component, pageProps }: AppProps<{ dehydratedState?: any }>) => {
  return (
    <Providers dehydratedState={pageProps.dehydratedState}>
      <Component {...pageProps} />

      <FloatingNavigation />
    </Providers>
  )
}

export default MyApp
