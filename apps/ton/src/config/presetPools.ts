// TODO: Use pools from json
// import testnetPools from 'public/lists/pools-testnet.json'
import { TonNetworks } from '@pancakeswap/ton-v2-sdk'

export const PRESET_POOLS = {
  [TonNetworks.Mainnet]: [],
  [TonNetworks.Testnet]: {
    // SYRUP-PAN
    'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F<>kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg':
      'EQB53lcd4hlB4VuZ2mTSjcZd1JSJJ1iY-kN9SIPIL9RrQU5B',
  },
}
