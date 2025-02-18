// TODO: Use pools from json
// import testnetPools from 'public/lists/pools-testnet.json'
import { TonNetworks } from '@pancakeswap/ton-v2-sdk'

export const PRESET_POOLS = {
  [TonNetworks.Mainnet]: [],
  [TonNetworks.Testnet]: {
    // SYRUP-PAN
    'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F<>kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg':
      'EQB53lcd4hlB4VuZ2mTSjcZd1JSJJ1iY-kN9SIPIL9RrQU5B',
    'kQBN6HSn7GmAB30K_YmL3vhS2ms5LMm9aPW0PGzvUZASRzng<>kQD0zbW5arqfo7uaNs7TiBckhPp0m8xZgsMs6qdBU85p9UVB':
      'kQBd0roLuicL47ortnzPc2tNQfYkD1LH27ippaO-6ba7srBd',
  },
}
