import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
import { useAccount, useChainId } from 'wagmi'
import { useIDOContract } from '../ido/useIDOContract'

declare global {
  interface Window {
    binancew3w: {
      pcs: {
        sign: (params: { binanceChainId: string; contractAddress: string; address: string }) => Promise<{
          code: string
          message: string
          success: boolean
          data: {
            signature: string
            expireAt: number
          }
        }>
      }
    }
  }
}

export const useW3WAccountSign = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const contract = useIDOContract()

  const sign = useCallback(async () => {
    if (!address) throw new Error('No address provided')
    if (typeof window === 'undefined' || typeof window.binancew3w?.pcs?.sign === 'undefined')
      throw new Error('Cannot sign message')

    console.log('signing w3w account', {
      binanceChainId: `${chainId}`,
      contractAddress: contract?.address ?? '',
      address,
    })

    return window.binancew3w.pcs.sign({
      binanceChainId: `${chainId}`,
      contractAddress: contract?.address ?? '',
      address,
    })
  }, [address, contract?.address, chainId])

  return sign
}

interface W3WSignResponse {
  code: SignResponseCode
  success: boolean
  message: string
  data: {
    // if address is not a w3w address, signature will be null
    // @note: signature is not a string starting with 0x
    signature: string | null
    // time in seconds
    expireAt: number
  }
}

enum SignResponseCode {
  Normal = '000000',
  SystemError = '000001',
  IllegalParams = '000002',
  SignatureError = '001012',
  IllegalTimestamp = '351005',
  IllegalNonce = '351082',
  IllegalAddress = '351026',
  RestrictedAddress = '351083',
}

export class W3WSignRestrictedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'W3WSignRestrictedError'
  }
}

const w3wSign = async ({
  address,
  contractAddress,
  signature,
  timestamp,
  nonce,
}: {
  address: Address
  contractAddress: Address
  signature: Hex
  timestamp: number
  nonce: string | number
}): Promise<{
  signature: string | null
  expireAt: number
}> => {
  try {
    const response = await fetch('/api/w3w/sign', {
      method: 'POST',
      body: JSON.stringify({
        timestamp,
        address,
        contractAddress,
        nonce,
        signature,
      }),
    })
    const result: W3WSignResponse = await response.json()

    if (result.code === SignResponseCode.RestrictedAddress) {
      throw new W3WSignRestrictedError('Restricted address')
    }

    if (result.code !== SignResponseCode.Normal) {
      throw new Error('Failed to sign')
    }

    return {
      signature: result.data?.signature,
      expireAt: result.data?.expireAt,
    }
  } catch (error) {
    console.error('Error signing W3W account:', error)
    return {
      signature: null,
      expireAt: 0,
    }
  }
}
