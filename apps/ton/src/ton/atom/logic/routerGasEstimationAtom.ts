import { atom } from 'jotai'
import { TonContractNames } from 'ton/ton.enums'
import { contractAtom } from '../context/contractAtom'

export const routerGasEstimationAtom = atom(async (get) => {
  const routerContract = get(contractAtom(TonContractNames.Router))
  return routerContract.estimateAddLiquidity(0n)
})
