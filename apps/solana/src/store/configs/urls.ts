import { API_URLS } from '@raydium-io/raydium-sdk-v2'

export const urlConfigs = {
  ...API_URLS,
  BASE_HOST: process.env.NEXT_PUBLIC_EXPLORE_API_ENDPOINT ?? API_URLS.BASE_HOST,
  POOL_LIST: '/cached/v1/pools/info/list',
  INFO: '/cached/v1/pools/stats/overview'
}
