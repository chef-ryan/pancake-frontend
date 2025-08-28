// TODO: Using IFO v10 ABI for testing
// import { ifoABI } from 'config/abi/ifo'
import { getContract } from 'utils/contractHelpers'
import { createPublicClient, custom, http, isAddress, type WalletClient } from 'viem'
import { bsc } from 'viem/chains'
import { ifoConfigs } from 'views/IfosV2/config'
import { ifoV10Abi as ifoABI } from '../../abi/ifoV10Abi'

function getIfoAddressFromUrl(): `0x${string}` | null {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') return null

  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('testIfoAddress') as `0x${string}` | null
  }

  return process.env.NEXT_PUBLIC_BSC_TESTNET_IFO_ADDRESS as `0x${string}` | null
}

function getIFOAddress(ifoId: string): `0x${string}` {
  const contractAddressFromQuery = getIfoAddressFromUrl()
  if (contractAddressFromQuery && isAddress(contractAddressFromQuery)) {
    return contractAddressFromQuery
  }
  const ifoConfig = ifoConfigs.find((x) => x.id === ifoId)
  return ifoConfig.contractAddress
}

export function getIFOContract(ifoId: string, signer?: WalletClient, chainId?: number) {
  const ifoAddress = getIFOAddress(ifoId)
  return getContract({
    address: ifoAddress,
    abi: ifoABI,
    signer,
    chainId,
    publicClient: createPublicClient({
      chain: bsc,
      // TODO: Using Tenderly Virtual Network for IFO v10 testing
      transport:
        typeof window !== 'undefined' && window.ethereum
          ? custom(window.ethereum as any)
          : http('https://virtual.binance.eu.rpc.tenderly.co/08d597ab-f1d8-43bf-9fbf-6ba2fb94f081'),
      // transport: typeof window !== 'undefined' && window.ethereum ? custom(window.ethereum as any) : http(),
    }),
  })
}
