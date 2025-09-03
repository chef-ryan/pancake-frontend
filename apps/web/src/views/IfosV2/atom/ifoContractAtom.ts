import { atomFamily } from 'jotai/utils'
import { atom } from 'jotai'
import { getIFOContract } from '../hooks/ifo/useIFOContract'

export const ifoContractAtom = atomFamily((id: string) => {
  return atom(() => {
    return getIFOContract(id)
  })
})
