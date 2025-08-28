import { useQuery } from '@tanstack/react-query'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { getViemClients } from 'utils/viem'
import type { Address } from 'viem'
import useIfo from '../useIfo'

export type PoolInfo = {
  pid: number
  /**
   * token address that is used to stake in the pool
   */
  poolToken: Address
  /**
   * Amount of tokens raised in the pool
   */
  raisingAmountPool: bigint
  /**
   * Amount of tokens offered in the pool
   *
   * if pool is not offering tokens, it will be 0
   */
  offeringAmountPool: bigint
  /**
   * Maximum amount of tokens a user can stake in the pool
   */
  capPerUserInLP: bigint
  /**
   * Total amount of tokens staked in the pool
   */
  totalAmountPool: bigint
}

export type IFOPoolInfo = {
  pool0Info: PoolInfo | undefined
  pool1Info: PoolInfo | undefined
  /**
   * Start timestamp of the pool
   */
  startTimestamp: number
  /**
   * End timestamp of the pool
   */
  endTimestamp: number
}

export const useIFOPoolInfo = () => {
  const { chainId } = useActiveChainId()
  const { ifoContract } = useIfo()
  const latestTxReceipt = useLatestTxReceipt()

  return useQuery({
    queryKey: ['ifoPoolInfo', chainId, latestTxReceipt],
    queryFn: async (): Promise<IFOPoolInfo> => {
      const publicClient = getViemClients({ chainId })
      if (!ifoContract || !publicClient) throw new Error('IFO contract not found')

      const [pool0Token, pool1Token, _pool0Info, _pool1Info, startTimestamp, endTimestamp] =
        await publicClient.multicall({
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
              functionName: 'viewPoolInformation',
              args: [0n],
            },
            {
              address: ifoContract.address,
              abi: ifoContract.abi,
              functionName: 'viewPoolInformation',
              args: [1n],
            },
            {
              address: ifoContract.address,
              abi: ifoContract.abi,
              functionName: 'startTimestamp',
            },
            {
              address: ifoContract.address,
              abi: ifoContract.abi,
              functionName: 'endTimestamp',
            },
          ],
          allowFailure: false,
        })

      // TODO: IFO v10 viewPoolInformation returns: [offeringAmountPool, raisingAmountPool, limitPerUserInLP, hasTax, flatTaxRate, totalAmountPool]
      const pool0Info = {
        pid: 0,
        poolToken: pool0Token,
        offeringAmountPool: _pool0Info[0], // offeringAmountPool
        raisingAmountPool: _pool0Info[1], // raisingAmountPool
        capPerUserInLP: _pool0Info[2], // limitPerUserInLP
        hasTax: _pool0Info[3], // hasTax
        flatTaxRate: _pool0Info[4], // flatTaxRate
        totalAmountPool: _pool0Info[5], // totalAmountPool
      }

      const pool1Info = {
        pid: 1,
        poolToken: pool1Token,
        offeringAmountPool: _pool1Info[0], // offeringAmountPool
        raisingAmountPool: _pool1Info[1], // raisingAmountPool
        capPerUserInLP: _pool1Info[2], // limitPerUserInLP
        hasTax: _pool1Info[3], // hasTax
        flatTaxRate: _pool1Info[4], // flatTaxRate
        totalAmountPool: _pool1Info[5], // totalAmountPool
      }

      return {
        pool0Info: pool0Info.offeringAmountPool > 0n ? pool0Info : undefined,
        pool1Info: pool1Info.offeringAmountPool > 0n ? pool1Info : undefined,
        startTimestamp: Number(startTimestamp),
        endTimestamp: Number(endTimestamp),
      }
    },
    enabled: !!ifoContract,
  })
}
