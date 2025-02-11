import { Contracts, TonContractNames, TonNetworks } from '@pancakeswap/ton-v2-sdk'
import { TonClient } from '@ton/ton'
import { writeFileSync } from 'fs'
import path from 'path'
import { TonEndPoints } from 'ton/context/endpoints'
import { parseAddress } from 'ton/utils/address'
import { JettonMasterUSDT } from 'ton/wrappers/tact_JettonMasterUSDT'
import { Router } from 'ton/wrappers/tact_Router'
import mainnetList from '../../public/lists/main.json'
import testnetList from '../../public/lists/testnet.json'

const key = (token0, token1) => `${token0.address}-${token1.address}`

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

const getPoolAddress = async (network: TonNetworks, token0Address: any, token1Address: any) => {
  const client = new TonClient({ endpoint: TonEndPoints[network] })
  const router = client.open(Router.fromAddress(parseAddress(Contracts[TonContractNames.PCSRouter][network].address)))

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

const generatePoolsForPairs = async (network: TonNetworks, pairs: any[]) => {
  const pools = {}
  console.log(`[${network}] Fetching pool addresses for ${pairs.length} pairs`)
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i]
    const token0 = pair[0]
    const token1 = pair[1]

    // eslint-disable-next-line no-await-in-loop
    const poolAddress = await getPoolAddress(network, token0.address, token1.address)

    console.log(`[${network}] Pool Address for ${token0.symbol}-${token1.symbol}: ${poolAddress.toString()}`)

    if (poolAddress) {
      pools[key(token0, token1)] = poolAddress.toString()
    }

    // eslint-disable-next-line no-await-in-loop
    await sleep(50)
  }

  writeFileSync(path.resolve(__dirname, `../../public/lists/pools-${network}.json`), JSON.stringify(pools, null, 2), {
    flag: 'w+',
  })
}

export const buildPools = async () => {
  const mainnetTokens = mainnetList.tokens
  const testnetTokens = testnetList.tokens

  const mainnetPairs = getTokenPairs(mainnetTokens)
  const testnetPairs = getTokenPairs(testnetTokens)

  //   await generatePoolsForPairs(TonNetworks.Mainnet, mainnetPairs)
  await generatePoolsForPairs(TonNetworks.Testnet, testnetPairs)
}

buildPools()
