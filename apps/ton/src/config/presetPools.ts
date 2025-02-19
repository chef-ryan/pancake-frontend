// TODO: Use pools from json
// import testnetPools from 'public/lists/pools-testnet.json'
import { TonNetworks } from '@pancakeswap/ton-v2-sdk'

export const PRESET_POOLS = {
  [TonNetworks.Mainnet]: [],
  [TonNetworks.Testnet]: {
    // SYRUP-PAN
    'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F<>kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg':
      'EQB53lcd4hlB4VuZ2mTSjcZd1JSJJ1iY-kN9SIPIL9RrQU5B',
    // USDC-tTON
    'kQBN6HSn7GmAB30K_YmL3vhS2ms5LMm9aPW0PGzvUZASRzng<>kQD0zbW5arqfo7uaNs7TiBckhPp0m8xZgsMs6qdBU85p9UVB':
      'kQBd0roLuicL47ortnzPc2tNQfYkD1LH27ippaO-6ba7srBd',
    // SYRUP-tTON
    'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F<>kQD0zbW5arqfo7uaNs7TiBckhPp0m8xZgsMs6qdBU85p9UVB':
      'kQCY0hvhAb2aoovS76xidnk0in04ngvZsVNxECqBs3deEnve',
    // PAN-tTON
    'kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg<>kQD0zbW5arqfo7uaNs7TiBckhPp0m8xZgsMs6qdBU85p9UVB':
      'kQCgANQV9W0L7p0NaXYtHgjIRs8kFq6hRn5SDhq5Gdnz5eC0',
  },
}
