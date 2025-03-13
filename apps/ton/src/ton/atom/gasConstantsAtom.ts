import { GAS_CONSTANTS } from '@pancakeswap/ton-v2-sdk'
import { atom } from 'jotai'
import { chainIdAtom } from './chainIdAtom'

export const gasConstantsAtom = atom((get) => GAS_CONSTANTS[get(chainIdAtom)])
