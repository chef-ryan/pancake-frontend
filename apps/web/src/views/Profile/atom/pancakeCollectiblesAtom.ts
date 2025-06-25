import { atomWithAsyncRetry } from 'utils/atomWithAsyncRetry'
import { getCollections } from 'state/nftMarket/helpers'
import { ChainId } from '@pancakeswap/chains'
import { getPancakeProfileAddress } from 'utils/addressHelpers'
import { getProfileContract } from 'utils/contractHelpers'
import { pancakeProfileABI } from 'config/abi/pancakeProfile'
import { viemServerClients } from 'utils/viem.server'
import { Collection } from 'state/nftMarket/types'

export const pancakeCollectiblesAtom = atomWithAsyncRetry<Collection[]>({
  asyncFn: async () => {
    const fetchedCollections = await getCollections()
    if (!fetchedCollections || !Object.keys(fetchedCollections).length) {
      return []
    }
    try {
      const profileContract = getProfileContract()
      const nftRole = await profileContract.read.NFT_ROLE()
      const collectionRoles = await viemServerClients[ChainId.BSC].multicall({
        contracts: Object.keys(fetchedCollections).map((collectionAddress) => ({
          abi: pancakeProfileABI,
          address: getPancakeProfileAddress(),
          functionName: 'hasRole',
          args: [nftRole, collectionAddress],
        })),
        allowFailure: false,
      })
      return Object.values(fetchedCollections).filter((_, index) => collectionRoles[index])
    } catch (error) {
      console.error(error)
      return []
    }
  },
  fallbackValue: [],
})
