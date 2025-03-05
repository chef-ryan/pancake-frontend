import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const DEFAULT_VALUE = false

const userAudioPlayAtom = atomWithStorage('pcs:audio-play-2', DEFAULT_VALUE)

export function useAudioPlay() {
  return [...useAtom(userAudioPlayAtom), DEFAULT_VALUE] as const
}
