import { ASSET_CDN } from 'config/constants/endpoints'
import memoize from 'lodash/memoize'

export const getAssetUrl = memoize((asset: string): string => {
  return `${ASSET_CDN}/ton/images/${asset}`
})

export function truncateHash(hash?: string, chars = 6): string {
  if (!hash) return ''
  return `${hash.substring(0, chars)}...${hash.substring(hash.length - chars)}`
}

/**
 * Key for a pair of tokens for pre-built pools list
 */
export function presetKey(token0: string, token1: string): string {
  return `${token0}<>${token1}`
}

export function parsePresetKey(key: string): string[] {
  return key.split('<>')
}
