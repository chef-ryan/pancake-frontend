import { useQuery } from '@tanstack/react-query'
import { QUERY_SETTINGS_IMMUTABLE } from 'config/constants'
import { useCurrency } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { getViemClients } from 'utils/viem'
import { isAddressEqual, zeroAddress } from 'viem'
import type { Address } from 'viem/accounts'
import { useIfoV2Context } from '../../contexts/IfoV2Context'

type IFOAddresses = {
  lpToken0: Address
  lpToken1: Address | undefined
  offeringToken: Address
  adminAddress: Address
}

export const useIFOAddresses = () => {
  const { chainId } = useActiveChainId()
  const { ifoContract } = useIfoV2Context()

  return useQuery({
    queryKey: ['ifoAddresses', chainId],
    queryFn: async (): Promise<IFOAddresses> => {
      const publicClient = getViemClients({ chainId })
      if (!ifoContract || !publicClient) throw new Error('IFO contract not found')

      const [lpToken0, lpToken1, offeringToken, adminAddress] = await publicClient.multicall({
        allowFailure: false,
        contracts: [
          {
            address: ifoContract.address,
            abi: ifoContract.abi,
            functionName: 'addresses',
            args: [0n],
          },
          {
            address: ifoContract.address,
            abi: ifoContract.abi,
            functionName: 'addresses',
            args: [1n],
          },
          {
            address: ifoContract.address,
            abi: ifoContract.abi,
            functionName: 'addresses',
            args: [2n],
          },
          {
            address: ifoContract.address,
            abi: ifoContract.abi,
            functionName: 'addresses',
            args: [3n],
          },
        ],
      })

      return {
        lpToken0,
        lpToken1: isAddressEqual(lpToken1, zeroAddress) ? undefined : lpToken1,
        offeringToken,
        adminAddress,
      }
    },
    enabled: !!ifoContract,
    ...QUERY_SETTINGS_IMMUTABLE,
  })
}

export const useIFOCurrencies = () => {
  const { data: addresses } = useIFOAddresses()
  const stakeCurrency0 = useCurrency(addresses?.lpToken0)
  const stakeCurrency1 = useCurrency(addresses?.lpToken1)
  const offeringCurrency = useCurrency(addresses?.offeringToken)

  return {
    stakeCurrency0,
    stakeCurrency1,
    offeringCurrency,
  }
}
