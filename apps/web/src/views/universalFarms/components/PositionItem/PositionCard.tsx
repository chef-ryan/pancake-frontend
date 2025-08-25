import { Protocol } from '@pancakeswap/farms'
import {
  InfinityBinPositionDetail,
  InfinityCLPositionDetail,
  PositionDetail,
  StableLPDetail,
  V2LPDetail,
} from 'state/farmsV4/state/accountPositions/type'
import { getKeyForPools } from 'state/farmsV4/hooks'
import { InfinityPositionActions } from '../PositionActions/InfinityPositionActions'
import { InfinityBinPositionItem } from './InfinityBinPositionItem'
import { InfinityCLPositionItem } from './InfinityCLPositionItem'
import { StablePositionItem } from './StablePositionItem'
import { V2PositionItem } from './V2PositionItem'
import { V3PositionItem } from './V3PositionItem'

type Position = InfinityCLPositionDetail | InfinityBinPositionDetail | PositionDetail | V2LPDetail | StableLPDetail

interface PositionCardProps {
  data: Position
  poolLength?: number
  allInfinityPositions?: Array<InfinityCLPositionDetail | InfinityBinPositionDetail>
}

export const PositionCard = ({ data, poolLength, allInfinityPositions }: PositionCardProps) => {
  switch (data.protocol) {
    case Protocol.InfinityCLAMM:
      return (
        <InfinityCLPositionItem
          data={data as InfinityCLPositionDetail}
          action={
            <InfinityPositionActions pos={data as InfinityCLPositionDetail} positionList={allInfinityPositions || []} />
          }
        />
      )
    case Protocol.InfinityBIN:
      return (
        <InfinityBinPositionItem
          data={data as InfinityBinPositionDetail}
          action={
            <InfinityPositionActions
              pos={data as InfinityBinPositionDetail}
              positionList={allInfinityPositions || []}
            />
          }
        />
      )
    case Protocol.V3:
      return <V3PositionItem data={data as PositionDetail} poolLength={poolLength} />
    case Protocol.V2:
      return <V2PositionItem data={data as V2LPDetail} poolLength={poolLength} />
    case Protocol.STABLE:
      return <StablePositionItem data={data as StableLPDetail} poolLength={poolLength} />
    default:
      return null
  }
}

export const getPositionKey = (data: Position) => {
  switch (data.protocol) {
    case Protocol.InfinityCLAMM:
      return getKeyForPools({
        chainId: data.chainId,
        poolAddress: (data as InfinityCLPositionDetail).poolId,
        protocol: data.protocol,
        tokenId: (data as InfinityCLPositionDetail).tokenId,
      })
    case Protocol.InfinityBIN:
      return getKeyForPools({
        chainId: data.chainId,
        poolAddress: (data as InfinityBinPositionDetail).poolId,
        protocol: data.protocol,
        tokenId: (data as InfinityBinPositionDetail).activeId.toString(),
      })
    case Protocol.V3:
      return getKeyForPools({
        chainId: data.chainId,
        protocol: data.protocol,
        tokenId: (data as PositionDetail).tokenId.toString(),
      })
    case Protocol.V2:
      return getKeyForPools({
        chainId: (data as V2LPDetail).pair.chainId,
        poolAddress: (data as V2LPDetail).pair.liquidityToken.address,
      })
    case Protocol.STABLE:
      return getKeyForPools({
        chainId: (data as StableLPDetail).pair.liquidityToken.chainId,
        poolAddress: (data as StableLPDetail).pair.liquidityToken.address,
      })
    default:
      return ''
  }
}
