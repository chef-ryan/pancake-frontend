import { PublicKey } from '@solana/web3.js'
import { PublicKeyish } from './types'
import { SOLMint, WSOLMint } from './constants'

export function tryParsePublicKey(v: string): PublicKey | string {
  try {
    return new PublicKey(v)
  } catch (e) {
    return v
  }
}
export function validateAndParsePublicKey({
  publicKey: orgPubKey,
  transformSol,
}: {
  publicKey: PublicKeyish
  transformSol?: boolean
}): PublicKey {
  const publicKey = tryParsePublicKey(orgPubKey.toString())

  if (publicKey instanceof PublicKey) {
    if (transformSol && publicKey.equals(SOLMint)) return WSOLMint
    return publicKey
  }

  if (transformSol && publicKey.toString() === SOLMint.toBase58()) return WSOLMint

  if (typeof publicKey === 'string') {
    if (publicKey === PublicKey.default.toBase58()) return PublicKey.default
    try {
      const key = new PublicKey(publicKey)
      return key
    } catch {
      throw new Error('invalid public key')
    }
  }

  throw new Error('invalid public key')
}
