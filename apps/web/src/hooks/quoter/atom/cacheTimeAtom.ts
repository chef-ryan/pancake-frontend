import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

export const cacheBySecondsAtom = atomFamily((seconds: number) => {
  return atom((get) => {
    const sec = get(currentSeconds)
    return sec % seconds
  })
})

// Trigger update other place
export const currentSeconds = atom(Date.now() / 1000)
