import dotenv from 'dotenv'
import path from 'path'

import { Contracts, Native, TonChainId, TonContractNames } from '@pancakeswap/ton-v2-sdk'
import { TonClient } from '@ton/ton'
import { writeFileSync } from 'fs'
import { parseAddress } from 'ton/utils/address'
import { JettonMasterUSDT } from 'ton/wrappers/tact_JettonMasterUSDT'
import { Router } from 'ton/wrappers/tact_Router'
import { presetKey } from 'utils'

import chunk from 'lodash/chunk'

import mainnetList from '../../public/lists/main.json'
import testnetList from '../../public/lists/testnet.json'

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const TonEndPoints = {
  [TonChainId.Mainnet]:
    'https://attentive-warmhearted-fire.ton-mainnet.quiknode.pro/9a4ad85a1139b7d19fa1dc658547bdde9184bd4d/jsonRPC',
  [TonChainId.Testnet]: `https://testnet.toncenter.com/api/v2/jsonRPC?api_key=${process.env.NEXT_PUBLIC_TONCENTER_TESTNET_API_KEY}`,
}

const mainnetClient = new TonClient({ endpoint: TonEndPoints[TonChainId.Mainnet] })
const testnetClient = new TonClient({ endpoint: TonEndPoints[TonChainId.Testnet] })

const key = (token0, token1) => presetKey(token0.address, token1.address)

const getTokenPairs = (tokens: any[]) => {
  const pairs: any[] = []
  const seenPairs = new Set()
  for (let i = 0; i < tokens.length; i++) {
    for (let j = 0; j < tokens.length; j++) {
      if (i !== j) {
        const pairKey = key(tokens[i], tokens[j])
        const reversePairKey = key(tokens[j], tokens[i])
        if (!seenPairs.has(reversePairKey)) {
          pairs.push([tokens[i], tokens[j]])
          seenPairs.add(pairKey)
        }
      }
    }
  }
  return pairs
}

const getPoolAddress = async (chainId: TonChainId, token0Address: any, token1Address: any) => {
  const client = chainId === TonChainId.Testnet ? testnetClient : mainnetClient
  const router = client.open(Router.fromAddress(parseAddress(Contracts[TonContractNames.PCSRouter][chainId].address)))

  const jettonMaster0 = client.open(JettonMasterUSDT.fromAddress(parseAddress(token0Address)))
  const jettonMaster1 = client.open(JettonMasterUSDT.fromAddress(parseAddress(token1Address)))

  const [jettonWalletAddress0, jettonWalletAddress1] = await Promise.all([
    jettonMaster0.getGetWalletAddress(parseAddress(router.address.toString())),
    jettonMaster1.getGetWalletAddress(parseAddress(router.address.toString())),
  ])

  const poolAddress = await router.getGetPoolAddress(jettonWalletAddress0, jettonWalletAddress1)

  return poolAddress
}

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const generatePoolsForPairs = async (chainId: TonChainId, pairs: any[][]) => {
  console.log(`[${chainId}] Fetching pool addresses for ${pairs.length} pairs`)

  const pools = {}
  const BATCH_SIZE = 20
  const DELAY = 100

  const chunks = chunk(pairs, BATCH_SIZE)

  for (let i = 0; i < chunks.length; i++) {
    const chunkPairs = chunks[i]

    // eslint-disable-next-line no-await-in-loop
    await Promise.all(
      chunkPairs.map(async (pair) => {
        try {
          const [token0, token1] = pair
          const poolAddress = await getPoolAddress(chainId, token0.address, token1.address)

          console.log(`[${chainId}] ☑️  Pool Address for ${token0.symbol}-${token1.symbol}: ${poolAddress.toString()}`)

          if (poolAddress)
            pools[key(token0, token1)] = {
              token0: token0.address,
              token1: token1.address,
              poolAddress: poolAddress.toString(),
            }
        } catch (error: any) {
          console.error(
            `buildPools [${chainId}]: ⚠️  Error processing pair ${pair[0].symbol}-${pair[1].symbol}`,
            error?.message,
          )
        }
      }),
    )

    // eslint-disable-next-line no-await-in-loop
    await sleep(DELAY)
  }

  writeFileSync(path.resolve(__dirname, `../../public/lists/pools_${chainId}.json`), JSON.stringify(pools, null, 2), {
    flag: 'w+',
  })
}

export const buildPools = async () => {
  const mainnetTokens = [Native.onChain(TonChainId.Mainnet).wrapped, ...mainnetList.tokens]
  const testnetTokens = [Native.onChain(TonChainId.Testnet).wrapped, ...testnetList.tokens]

  const mainnetPairs = getTokenPairs(mainnetTokens)
  const testnetPairs = getTokenPairs(testnetTokens)

  await generatePoolsForPairs(TonChainId.Mainnet, mainnetPairs)
  await generatePoolsForPairs(TonChainId.Testnet, testnetPairs)
}

buildPools()
