import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { getViemClients } from 'utils/viem'
import type { Address } from 'viem'
import { zeroAddress } from 'viem'
import { CurrencyAmount, Price } from '@pancakeswap/swap-sdk-core'
import { useCurrency } from 'hooks/Tokens'
import { useIfoV2Context } from '../../contexts/IfoV2Context'
import { useIFOAddresses } from './useIFOAddresses'
import type { PoolInfo } from '../../ifov2.types'

interface RawPoolInfo {
  pid: number
  poolToken: Address
  offeringAmountPool: bigint
  raisingAmountPool: bigint
  capPerUserInLP: bigint
  hasTax: boolean
  flatTaxRate: bigint
  totalAmountPool: bigint
}

export const useIFOPoolInfo = (): PoolInfo[] => {
  const { chainId } = useActiveChainId()
  const { ifoContract } = useIfoV2Context()
  const latestTxReceipt = useLatestTxReceipt()
  const { data: addresses } = useIFOAddresses()
  const stakeCurrency0 = useCurrency(addresses?.lpToken0)
  const stakeCurrency1 = useCurrency(addresses?.lpToken1)
  const offeringCurrency = useCurrency(addresses?.offeringToken)

  const { data } = useQuery({
    queryKey: ['ifoPoolInfo', chainId, addresses, latestTxReceipt],
    queryFn: async (): Promise<[RawPoolInfo, RawPoolInfo]> => {
      const publicClient = getViemClients({ chainId })
      if (!ifoContract || !publicClient || !addresses) throw new Error('IFO contract not found')

      const [_pool0Info, _pool1Info] = await publicClient.multicall({
        contracts: [
          {
            address: ifoContract.address,
            abi: ifoContract.abi,
            functionName: 'viewPoolInformation',
            args: [0n],
          },
          {
            address: ifoContract.address,
            abi: ifoContract.abi,
            functionName: 'viewPoolInformation',
            args: [1n],
          },
        ],
        allowFailure: false,
      })

      const pool0Info: RawPoolInfo = {
        pid: 0,
        poolToken: addresses.lpToken0,
        offeringAmountPool: _pool0Info[0],
        raisingAmountPool: _pool0Info[1],
        capPerUserInLP: _pool0Info[2],
        hasTax: _pool0Info[3],
        flatTaxRate: _pool0Info[4],
        totalAmountPool: _pool0Info[5],
      }

      const pool1Info: RawPoolInfo = {
        pid: 1,
        poolToken: (addresses.lpToken1 ?? zeroAddress) as Address,
        offeringAmountPool: _pool1Info[0],
        raisingAmountPool: _pool1Info[1],
        capPerUserInLP: _pool1Info[2],
        hasTax: _pool1Info[3],
        flatTaxRate: _pool1Info[4],
        totalAmountPool: _pool1Info[5],
      }

      return [pool0Info, pool1Info]
    },
    enabled: !!ifoContract && !!addresses,
  })

  return useMemo(() => {
    if (!data) return []
    const [pool0Info, pool1Info] = data
    const pools: PoolInfo[] = []

    if (pool0Info.offeringAmountPool > 0n) {
      const stakeCurrency = stakeCurrency0
      pools.push({
        ...pool0Info,
        stakeCurrency,
        price:
          stakeCurrency && offeringCurrency
            ? new Price(offeringCurrency, stakeCurrency, pool0Info.offeringAmountPool, pool0Info.raisingAmountPool)
            : undefined,
        raise: stakeCurrency ? CurrencyAmount.fromRawAmount(stakeCurrency, pool0Info.raisingAmountPool) : undefined,
        saleAmount: offeringCurrency
          ? CurrencyAmount.fromRawAmount(offeringCurrency, pool0Info.offeringAmountPool)
          : undefined,
      })
    }

    if (pool1Info.offeringAmountPool > 0n) {
      const stakeCurrency = stakeCurrency1
      pools.push({
        ...pool1Info,
        stakeCurrency,
        price:
          stakeCurrency && offeringCurrency
            ? new Price(offeringCurrency, stakeCurrency, pool1Info.offeringAmountPool, pool1Info.raisingAmountPool)
            : undefined,
        raise: stakeCurrency ? CurrencyAmount.fromRawAmount(stakeCurrency, pool1Info.raisingAmountPool) : undefined,
        saleAmount: offeringCurrency
          ? CurrencyAmount.fromRawAmount(offeringCurrency, pool1Info.offeringAmountPool)
          : undefined,
      })
    }

    return pools
  }, [data, stakeCurrency0, stakeCurrency1, offeringCurrency])
}

export default useIFOPoolInfo
