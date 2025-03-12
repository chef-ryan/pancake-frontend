/**
 * Pre-fetch and store jettonData in currency from JettonMaster.get_jetton_data()
 */

import { TonChainId } from '@pancakeswap/ton-v2-sdk'
import { JettonMaster, TonClient } from '@ton/ton'
import dotenv from 'dotenv'
import path from 'path'

import { writeFileSync } from 'fs'
import chunk from 'lodash/chunk'
import { parseAddress } from 'ton/utils/address'
import { TokenInfo } from 'utils/tokens/types'
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function processTokensByChain(chainId: TonChainId, tokens: TokenInfo[]) {
  const client = chainId === TonChainId.Testnet ? testnetClient : mainnetClient

  const chunkedTokens = chunk(tokens, 40)

  let results: TokenInfo[] = []

  for (let i = 0; i < chunkedTokens.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const result = await Promise.all(
      chunkedTokens[i].map(async (token) => {
        // Skip if token already has jettonData
        if (token.jettonCode && token.jettonCode.length > 0) {
          console.log(`buildJettons [${chainId}]: ⏭️  Skipping ${token.symbol} ${token.address}`)
          return token
        }

        try {
          const jettonMaster = client.open(JettonMaster.create(parseAddress(token.address)))
          const jettonData = await jettonMaster.getJettonData()

          const walletCodeHex = jettonData.walletCode.toBoc().toString('hex')

          console.log(`buildJettons [${chainId}]: ✅ ${token.symbol} ${token.address}`)

          return {
            ...token,
            jettonCode: walletCodeHex,
          }
        } catch (error: any) {
          console.error(
            `buildJettons [${chainId}]: ⚠️  Error processing token ${token.symbol} ${token.address}`,
            error?.message,
          )
          return token
        }
      }),
    )

    results = results.concat(result)

    // eslint-disable-next-line no-await-in-loop
    await sleep(100)
  }

  console.log(`buildJettons [${chainId}]: ✅ ${results.length} tokens processed`)

  writeFileSync(
    path.resolve(__dirname, `../../public/lists/${chainId === TonChainId.Mainnet ? 'main' : 'testnet'}.json`),
    JSON.stringify({ ...mainnetList, tokens: results }, null, 2),
  )
}

async function buildJettonData() {
  // Compute mainnet jettonData
  const mainnetTokens = mainnetList.tokens
  const testnetTokens = testnetList.tokens

  await processTokensByChain(TonChainId.Mainnet, mainnetTokens)
  await processTokensByChain(TonChainId.Testnet, testnetTokens)
}

buildJettonData()
