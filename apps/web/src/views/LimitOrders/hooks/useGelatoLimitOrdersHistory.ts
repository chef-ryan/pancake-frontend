import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { usePublicClient } from 'wagmi'
import { gelatoLimitABI } from 'config/abi/gelatoLimit'
import { useMemo } from 'react'
import { ExistingOrder, ORDER_CATEGORY } from '../types'

export const EXISTING_ORDERS_QUERY_KEY = ['limitOrders', 'gelato', 'existingOrders']
export const OPEN_ORDERS_QUERY_KEY = ['limitOrders', 'gelato', 'openOrders']
export const EXECUTED_CANCELLED_ORDERS_QUERY_KEY = ['limitOrders', 'gelato', 'cancelledExecutedOrders']
export const GELATO_CONTRACT_ADDRESS = '0x0c30D3d66bc7C73A83fdA929888c34dcb24FD599'

type DepositLog = {
  key: string
  transactionHash: string
  caller: string
  amount: string
  blockNumber: number
  data: {
    module: string
    inputToken: string
    owner: string
    witness: string
    data: string
    secret: string
  }
}

const useExistingOrders = (turnOn: boolean): ExistingOrder[] => {
  const { account, chainId } = useAccountActiveChain()

  const provider = usePublicClient({ chainId })

  const startFetch = turnOn && account && chainId && provider

  const { data } = useQuery({
    queryKey: [...EXISTING_ORDERS_QUERY_KEY, account],

    queryFn: async () => {
      if (!account || !chainId || !provider) {
        throw new Error('Missing account or chainId')
      }

      try {
        const response = await fetch(`https://proofs.pancakeswap.com/gelato/v1/${account}.log`)

        if (response.status === 404) {
          return undefined
        }

        const logs: DepositLog[] = await response.json()

        const existRoles = await provider.multicall({
          contracts: logs.map((log) => {
            return {
              abi: gelatoLimitABI,
              address: GELATO_CONTRACT_ADDRESS,
              functionName: 'existOrder',
              args: [log.data.module, log.data.inputToken, log.data.owner, log.data.witness, log.data.data],
            }
          }) as any[],
        })

        return logs
          .filter((_, index) => existRoles[index]?.status === 'success' && existRoles[index]?.result)
          .map((log) => ({
            transactionHash: log.transactionHash,
            module: log.data.module,
            inputToken: log.data.inputToken,
            owner: log.data.owner,
            witness: log.data.witness,
            data: log.data.data,
          }))
      } catch (e) {
        console.error('Error fetching logs or querying existOrder', e)
        return undefined
      }
    },
    enabled: Boolean(startFetch),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  return useMemo(() => data ?? [], [data])
}

export default function useGelatoLimitOrdersHistory(orderCategory: ORDER_CATEGORY) {
  const existingOrders = useExistingOrders(orderCategory === ORDER_CATEGORY.Existing)

  const orders = useMemo(() => {
    switch (orderCategory as ORDER_CATEGORY) {
      case ORDER_CATEGORY.Existing:
        return existingOrders
      default:
        return []
    }
  }, [orderCategory, existingOrders])

  return useMemo(() => {
    if (orderCategory === ORDER_CATEGORY.Existing) {
      return orders
    }
    return []
  }, [orders, orderCategory])
}
