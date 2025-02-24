// next.config.mjs
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin'

import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const withVanillaExtract = createVanillaExtractPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for catching potential issues in your app
  reactStrictMode: true,

  swcMinify: false,

  // Optimize image handling with Next.js' Image Optimization
  images: {
    domains: [], // Add domains for external images if needed
  },

  // Set custom environmental variables
  env: {},

  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/tgbot/_next/:path*',
          destination: '/_next/:path*',
        },
      ],
    }
  },

  // Adjust build output directory (default is `.next`)
  distDir: '.next',

  // Internationalization settings
  i18n: {
    locales: ['en'], // List of supported locales
    defaultLocale: 'en', // Default locale
  },

  compiler: {
    styledComponents: true,
  },

  typescript: {
    tsconfigPath: 'tsconfig.json',
  },

  experimental: {
    scrollRestoration: true,
    fallbackNodePolyfills: false,
    optimizePackageImports: ['@pancakeswap/widgets-internal', '@pancakeswap/uikit'],
    outputFileTracingRoot: path.join(__dirname, '../../'),
    outputFileTracingExcludes: {
      '*': [],
    },
  },

  transpilePackages: [
    '@pancakeswap/localization',
    '@pancakeswap/hooks',
    '@pancakeswap/utils',
    '@pancakeswap/widgets-internal',
    '@pancakeswap/uikit',
    // https://github.com/TanStack/query/issues/6560#issuecomment-1975771676
    '@tanstack/query-core',
  ],
}

export default withVanillaExtract(nextConfig)
