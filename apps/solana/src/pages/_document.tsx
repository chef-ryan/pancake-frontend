import { ColorModeScript } from '@chakra-ui/react'
import NextDocument, { Html, Main, Head, NextScript } from 'next/document'
import { theme } from '@/theme'

/**
 * @see https://chakra-ui.com/docs/styled-system/color-mode#for-nextjs
 */
export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en" suppressHydrationWarning>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;800&amp;display=swap" rel="stylesheet" />
        </Head>

        <body>
          {/* 👇 Here's the script */}
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
