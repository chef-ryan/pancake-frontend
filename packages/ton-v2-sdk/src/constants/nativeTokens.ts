import { Token } from '../currency/Token'
import { TonChainId } from './ton.enums'

export const WNATIVE = {
  [TonChainId.Mainnet]: new Token(
    TonChainId.Mainnet,
    'EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez',
    9,
    'Proxy TON',
    'pTON',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ton/info/logo.png',
    'b5ee9c7201020b010001e1000114ff00f4a413f4bcf2c80b01020162020302b6d020c700925f04e001d0d3030171b0925f04e0ed44d0fa0001f863fa4001f864fa4001f865d1fa4001f86270f842805401fa443058baf2f4fa4031fa003171d721fa0031fa003073a9b400f861d31fd33ff842f844c705e302443004050139a0f605da89a1f40003f0c7f48003f0c9f48003f0cba3f087f089f08b110a026244302482100f8a7ea5ba8ea35f04821042a0fb43ba8e93f84382103b9aca00a070fb0270f8448306db3ce0840ff2f0e30d060702fc0482100f8a7ea5ba8eec03fa0031fa4031fa4031f40431fa0024c20022c200b0f2e0575341bcf841aa008209312d00a05230bcb0f2e0535121a170fb0213a1f84321a0f86382107362d09cc8cb1f12cb3f01fa02f842cf1601cf1670f84402c9128306db3cc8f843fa02f844cf16f845cf16c9ed547f935f0470e2dc840f08090028708018c8cb055003cf165003fa02cb6ac901fb0001c434f841aa008209312d00a05210bcf2e05303fa00fa40fa4031f40431fa00315152a013a170fb02f84321a1f863f843c2fff2e05582107362d09cc8cb1f13cb3f58fa02f842cf1658cf167001c9128306db3cc8f843fa02f844cf16f845cf16c9ed5408002c718018c8cb055004cf165004fa0212cb6accc901fb000004f2f00000',
  ),
  [TonChainId.Testnet]: new Token(
    TonChainId.Testnet,
    'kQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffAw5',
    9,
    'Proxy TON',
    'pTON',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ton/info/logo.png',
    'b5ee9c7201020b010001e1000114ff00f4a413f4bcf2c80b01020162020302b6d020c700925f04e001d0d3030171b0925f04e0ed44d0fa0001f863fa4001f864fa4001f865d1fa4001f86270f842805401fa443058baf2f4fa4031fa003171d721fa0031fa003073a9b400f861d31fd33ff842f844c705e302443004050139a0f605da89a1f40003f0c7f48003f0c9f48003f0cba3f087f089f08b110a026244302482100f8a7ea5ba8ea35f04821042a0fb43ba8e93f84382103b9aca00a070fb0270f8448306db3ce0840ff2f0e30d060702fc0482100f8a7ea5ba8eec03fa0031fa4031fa4031f40431fa0024c20022c200b0f2e0575341bcf841aa008209312d00a05230bcb0f2e0535121a170fb0213a1f84321a0f86382107362d09cc8cb1f12cb3f01fa02f842cf1601cf1670f84402c9128306db3cc8f843fa02f844cf16f845cf16c9ed547f935f0470e2dc840f08090028708018c8cb055003cf165003fa02cb6ac901fb0001c434f841aa008209312d00a05210bcf2e05303fa00fa40fa4031f40431fa00315152a013a170fb02f84321a1f863f843c2fff2e05582107362d09cc8cb1f13cb3f58fa02f842cf1658cf167001c9128306db3cc8f843fa02f844cf16f845cf16c9ed5408002c718018c8cb055004cf165004fa0212cb6accc901fb000004f2f00000',
  ),
}

export const NATIVE = {
  [TonChainId.Mainnet]: {
    chainId: TonChainId.Mainnet,
    decimals: 9,
    symbol: 'TON',
    name: 'TON',
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ton/info/logo.png',
  },
  [TonChainId.Testnet]: {
    chainId: TonChainId.Testnet,
    decimals: 9,
    symbol: 'TON',
    name: 'TON',
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ton/info/logo.png',
  },
}
