import { atomFamily } from 'jotai/utils'
import { useAtomValue } from 'jotai'
import { atomWithLoadable } from 'quoter/atom/atomWithLoadable'
import { AdSlide, RemoteAds } from '../ads.types'
import { JsonAds } from '../Ads/JsonAds'

export const jsonAdsConfigAtom = atomFamily((url: string) => {
  return atomWithLoadable<RemoteAds[]>(async () => {
    if (!url) return []
    const res = await fetch(url)
    return res.json()
  })
})

export const useJsonAdsConfig = (url: string): AdSlide[] => {
  const loadable = useAtomValue(jsonAdsConfigAtom(url))
  const jsonAds = loadable.unwrapOr([])

  return jsonAds.map((config) => ({
    id: config.id,
    component: <JsonAds ad={config} />,
  }))
}

export default useJsonAdsConfig
