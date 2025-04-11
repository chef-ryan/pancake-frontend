import { atom } from 'jotai'

export const quoteTimerAtom = atom(Math.floor(Date.now() / 1000))
