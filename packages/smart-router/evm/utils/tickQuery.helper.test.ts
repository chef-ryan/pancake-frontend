import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { FeeAmount, Tick, TICK_SPACINGS } from '@pancakeswap/v3-sdk'
import { Address, Hex, decodeFunctionResult, encodeFunctionData } from 'viem'
import { queryDataAbi } from '../abis/QueryData'
import { InfinityClPool, PoolType, V3Pool } from '../v3-router/types'

import { decodeResult, getCallData, getTickSpacing } from './tickQuery.helper'

vi.mock('viem', async () => {
  const actual = await vi.importActual<typeof import('viem')>('viem')
  return {
    ...actual,
    decodeFunctionResult: vi.fn(),
  }
})

const decodeFunctionResultMock = decodeFunctionResult as unknown as Mock<
  [Parameters<typeof decodeFunctionResult>[0]],
  Hex
>

const SHIFT = 128n

function buildRawTicksHex(entries: { index: number; liquidityNet: bigint }[]): Hex {
  const hex = entries
    .map(({ index, liquidityNet }) => {
      const encodedIndex = BigInt.asUintN(128, BigInt(index))
      const encodedLiquidity = BigInt.asUintN(128, liquidityNet)
      const raw = (encodedIndex << SHIFT) | encodedLiquidity
      return raw.toString(16).padStart(64, '0')
    })
    .join('')

  return `0x${hex}` as Hex
}

const v3Pool = {
  type: PoolType.V3,
  address: '0x0000000000000000000000000000000000000001' as Address,
  fee: FeeAmount.MEDIUM,
} as unknown as V3Pool

const infinityPool = {
  type: PoolType.InfinityCL,
  id: `0x${'11'.repeat(32)}`,
  tickSpacing: 15,
  fee: 100,
  poolManager: '0x0000000000000000000000000000000000000002' as Address,
} as unknown as InfinityClPool

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getCallData', () => {
  it('encodes V3 pool call data with pool address and length', () => {
    const len = 256n
    const expected = encodeFunctionData({
      abi: queryDataAbi,
      args: [v3Pool.address, len],
      functionName: 'queryUniv3TicksSuperCompact',
    })

    expect(getCallData(v3Pool, len)).toEqual(expected)
  })

  it('encodes Infinity pool call data with pool id and length', () => {
    const len = 128n
    const expected = encodeFunctionData({
      abi: queryDataAbi,
      args: [infinityPool.id, len],
      functionName: 'queryPancakeInfinityTicksSuperCompact',
    })

    expect(getCallData(infinityPool, len)).toEqual(expected)
  })
})

describe('decodeResult', () => {
  it('decodes V3 pool tick data using the Uniswap query function', () => {
    const rawTicks = buildRawTicksHex([{ index: 15, liquidityNet: 9n }])
    decodeFunctionResultMock.mockReturnValueOnce(rawTicks)
    const encodedResult = '0xabc123' as Hex

    const decoded = decodeResult(encodedResult, v3Pool)

    expect(decodeFunctionResultMock).toHaveBeenCalledWith(
      expect.objectContaining({
        abi: queryDataAbi,
        functionName: 'queryUniv3TicksSuperCompact',
        data: encodedResult,
      }),
    )

    expect(decoded).toHaveLength(1)
    expect(decoded[0]).toBeInstanceOf(Tick)
    expect(decoded[0]?.index).toBe(15)
    expect(decoded[0]?.liquidityNet).toBe(9n)
    expect(decoded[0]?.liquidityGross).toBe(9n)
  })

  it('decodes Infinity pool tick data using the Pancake Infinity query function', () => {
    const rawTicks = buildRawTicksHex([
      { index: -20, liquidityNet: -5n },
      { index: 10, liquidityNet: 12n },
    ])
    decodeFunctionResultMock.mockReturnValueOnce(rawTicks)
    const encodedResult = '0xdef456' as Hex

    const decoded = decodeResult(encodedResult, infinityPool)

    expect(decodeFunctionResultMock).toHaveBeenCalledWith(
      expect.objectContaining({
        abi: queryDataAbi,
        functionName: 'queryPancakeInfinityTicksSuperCompact',
        data: encodedResult,
      }),
    )

    expect(decoded).toHaveLength(2)
    expect(decoded[0]).toBeInstanceOf(Tick)
    expect(decoded[0]?.index).toBe(-20)
    expect(decoded[0]?.liquidityNet).toBe(-5n)
    expect(decoded[0]?.liquidityGross).toBe(5n)
    expect(decoded[1]?.index).toBe(10)
    expect(decoded[1]?.liquidityNet).toBe(12n)
    expect(decoded[1]?.liquidityGross).toBe(12n)
  })
})

describe('getTickSpacing', () => {
  it('returns tick spacing from TICK_SPACINGS for V3 pools', () => {
    expect(getTickSpacing(v3Pool)).toBe(TICK_SPACINGS[FeeAmount.MEDIUM])
  })

  it('returns tickSpacing property for Infinity pools', () => {
    expect(getTickSpacing(infinityPool)).toBe(infinityPool.tickSpacing)
  })
})
