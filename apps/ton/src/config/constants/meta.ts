import { ContextApi } from '@pancakeswap/localization'
import memoize from 'lodash/memoize'
import { ASSET_CDN } from './endpoints'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: 'PancakeSwap',
  description: 'Trade, earn, and own crypto on the all-in-one multichain DEX',
  image: `${ASSET_CDN}/web/og/hero.jpg`,
}

interface PathList {
  paths: { [path: string]: { title: string; basePath?: boolean; description?: string; image?: string } }
  defaultTitleSuffix: string
}

const getPathList = memoize((t: ContextApi['t']): PathList => {
  return {
    paths: {
      '/': { basePath: true, title: t('Swap'), image: `${ASSET_CDN}/web/og/swap.jpg` },
      '/liquidity/add/[[...currency]]': {
        basePath: true,
        title: t('Add Liquidity'),
        image: `${ASSET_CDN}/web/og/liquidity.jpg`,
      },
      '/liquidity/remove/[[...currency]]': {
        basePath: true,
        title: t('Remove Liquidity'),
        image: `${ASSET_CDN}/web/og/liquidity.jpg`,
      },
      '/liquidity': { title: t('Liquidity'), image: `${ASSET_CDN}/web/og/liquidity.jpg` },
    },
    defaultTitleSuffix: t('PancakeSwap'),
  }
})

export const getCustomMeta = memoize(
  (path: string, t: ContextApi['t'], _: string): PageMeta | null => {
    const pathList = getPathList(t)
    let pathMetadata = pathList.paths[path]
    if (!pathMetadata) {
      const basePath = Object.entries(pathList.paths).find(
        ([url, data]) => (data as any).basePath && path.startsWith(url),
      )?.[0]
      if (basePath) {
        pathMetadata = pathList.paths[basePath]
      }
    }

    if (pathMetadata) {
      return {
        title: `${pathMetadata.title} | PancakeSwap`,
        ...(pathMetadata.description && { description: pathMetadata.description }),
        image: pathMetadata.image,
      }
    }
    return null
  },
  (path, _, locale) => `${path}#${locale}`,
)
