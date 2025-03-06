import BigNumber from 'bignumber.js'
import { FloatingNavigation } from 'components/FloatingNavigation'
import { Providers } from 'components/Providers'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import '../styles/globals.css' // Import global CSS

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

const MyApp = ({ Component, pageProps }: AppProps<{ dehydratedState?: any }>) => {
  return (
    <>
      <Providers dehydratedState={pageProps.dehydratedState}>
        <Component {...pageProps} />

        <FloatingNavigation />
      </Providers>
      <Script
        strategy="afterInteractive"
        id="google-tag"
        dangerouslySetInnerHTML={{
          __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_NEW_GTAG}');
        `,
        }}
      />
    </>
  )
}

export default MyApp
