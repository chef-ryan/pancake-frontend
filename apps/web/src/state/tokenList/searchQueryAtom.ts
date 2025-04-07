import { atom, useAtom } from 'jotai'

const searchQueryAtom = atom<string>('')

export const useSearchQuery = () => {
  return useAtom(searchQueryAtom)
}
