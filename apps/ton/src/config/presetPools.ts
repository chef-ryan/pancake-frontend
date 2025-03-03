import { TonChainId } from '@pancakeswap/ton-v2-sdk'
import testnetPools from 'public/lists/pools_-3.json'

export const PRESET_POOLS: {
  [chainId in TonChainId]: {
    [tokenPair: string]: {
      token0: string
      token1: string
      poolAddress: string
    }
  }
} = {
  [TonChainId.Mainnet]: {},
  [TonChainId.Testnet]: testnetPools,
  // [TonChainId.Testnet]: {
  //   // PAN-TON
  //   'kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg<>kQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffAw5': {
  //     token0: 'kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg',
  //     token1: 'kQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffAw5',
  //     poolAddress: 'EQD_Lx2fpT3CDX16OzHWu4utvHkMqk4cww65uN53js4WY5Au',
  //   },
  //   // TON-USDC
  //   'kQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffAw5<>kQBN6HSn7GmAB30K_YmL3vhS2ms5LMm9aPW0PGzvUZASRzng': {
  //     token0: 'kQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffAw5',
  //     token1: 'kQBN6HSn7GmAB30K_YmL3vhS2ms5LMm9aPW0PGzvUZASRzng',
  //     poolAddress: 'EQDINV8OA01yK-fmAECxCXwskiQI_A5GAZYRBDnPhvrmzD8Y',
  //   },
  //   // TON-SYRUP
  //   'kQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffAw5<>kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F': {
  //     token0: 'kQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffAw5',
  //     token1: 'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F',
  //     poolAddress: 'EQCXqIbJ_Dq9cKa8p8WjAb2X9iM_d_72QPNOdU7cKUIcXEqg',
  //   },
  //   // RUBY-USDC
  //   'kQBN6HSn7GmAB30K_YmL3vhS2ms5LMm9aPW0PGzvUZASRzng<>kQDrYGRT12rOkdJFFvtDIS5xS_tnatlTEO55hnkClQYAv0q3': {
  //     token0: 'kQBN6HSn7GmAB30K_YmL3vhS2ms5LMm9aPW0PGzvUZASRzng',
  //     token1: 'kQDrYGRT12rOkdJFFvtDIS5xS_tnatlTEO55hnkClQYAv0q3',
  //     poolAddress: 'kQArNuzh9UZ3zZY28m2CwHfgIfKsP900sWyZ1tYXl3Evt_Gj',
  //   },
  //   // SYRUP-PAN
  //   'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F<>kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg': {
  //     token0: 'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F',
  //     token1: 'kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg',
  //     poolAddress: 'EQB53lcd4hlB4VuZ2mTSjcZd1JSJJ1iY-kN9SIPIL9RrQU5B',
  //   },
  //   // USDC-tTON
  //   'kQBN6HSn7GmAB30K_YmL3vhS2ms5LMm9aPW0PGzvUZASRzng<>kQD0zbW5arqfo7uaNs7TiBckhPp0m8xZgsMs6qdBU85p9UVB': {
  //     token0: 'kQBN6HSn7GmAB30K_YmL3vhS2ms5LMm9aPW0PGzvUZASRzng',
  //     token1: 'kQD0zbW5arqfo7uaNs7TiBckhPp0m8xZgsMs6qdBU85p9UVB',
  //     poolAddress: 'kQBd0roLuicL47ortnzPc2tNQfYkD1LH27ippaO-6ba7srBd',
  //   },
  //   // SYRUP-tTON
  //   'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F<>kQD0zbW5arqfo7uaNs7TiBckhPp0m8xZgsMs6qdBU85p9UVB': {
  //     token0: 'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F',
  //     token1: 'kQD0zbW5arqfo7uaNs7TiBckhPp0m8xZgsMs6qdBU85p9UVB',
  //     poolAddress: 'kQCY0hvhAb2aoovS76xidnk0in04ngvZsVNxECqBs3deEnve',
  //   },
  //   // PAN-tTON
  //   'kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg<>kQD0zbW5arqfo7uaNs7TiBckhPp0m8xZgsMs6qdBU85p9UVB': {
  //     token0: 'kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg',
  //     token1: 'kQD0zbW5arqfo7uaNs7TiBckhPp0m8xZgsMs6qdBU85p9UVB',
  //     poolAddress: 'kQCgANQV9W0L7p0NaXYtHgjIRs8kFq6hRn5SDhq5Gdnz5eC0',
  //   },
  //   // SYRUP-USDC
  //   'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F<>kQBN6HSn7GmAB30K_YmL3vhS2ms5LMm9aPW0PGzvUZASRzng': {
  //     token0: 'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F',
  //     token1: 'kQBN6HSn7GmAB30K_YmL3vhS2ms5LMm9aPW0PGzvUZASRzng',
  //     poolAddress: 'EQAOBiyyQ66AUj3hq2Cy9RQIN-km5gdjxXz5zs_Dl0kACe8W',
  //   },
  //   // SYRUP-Jet
  //   'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F<>kQCj6VUXJ2ydAOdxrhsiuU4pU0PPQ2nbHxhsTlBHkrOraY4z': {
  //     token0: 'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F',
  //     token1: 'kQCj6VUXJ2ydAOdxrhsiuU4pU0PPQ2nbHxhsTlBHkrOraY4z',
  //     poolAddress: 'EQBTknTRiOS4mFPqpctzueEVjo2UQum0aIbsq9MEpLCZjdMX',
  //   },
  //   // Jet-RB4
  //   'kQCj6VUXJ2ydAOdxrhsiuU4pU0PPQ2nbHxhsTlBHkrOraY4z<>kQAFlRlDdSoVFSXX9j7EcudkTedrix7JEVbjfps9oFXnIyJ9': {
  //     token0: 'kQCj6VUXJ2ydAOdxrhsiuU4pU0PPQ2nbHxhsTlBHkrOraY4z',
  //     token1: 'kQAFlRlDdSoVFSXX9j7EcudkTedrix7JEVbjfps9oFXnIyJ9',
  //     poolAddress: 'EQBgNjuZQ-G18kDCF3VfQXZYYEUpiYh_-rDh6B3YfU5jCETm',
  //   },
  //   // JET-RB4
  //   'EQAiihOa4xLY1gDK55C6LzSU5cRImwXJMmIKkjQ5T5e1wr85<>kQAFlRlDdSoVFSXX9j7EcudkTedrix7JEVbjfps9oFXnIyJ9': {
  //     token0: 'EQAiihOa4xLY1gDK55C6LzSU5cRImwXJMmIKkjQ5T5e1wr85',
  //     token1: 'kQAFlRlDdSoVFSXX9j7EcudkTedrix7JEVbjfps9oFXnIyJ9',
  //     poolAddress: 'EQDE_tbygSmE01uVhPQ0nsMT1lbFftuzx4SXJ0AAIFi8TFKo',
  //   },
  //   // TON-JET
  //   'kQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffAw5<>EQAiihOa4xLY1gDK55C6LzSU5cRImwXJMmIKkjQ5T5e1wr85': {
  //     token0: 'kQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffAw5',
  //     token1: 'EQAiihOa4xLYsYleyYhsy6CfsXkkP0tg',
  //     poolAddress: 'EQDsCbNuMFhlsyJlkSMQ2WNPLxY9Z1dXpeG4rKya2ypRzsHu',
  //   },
  // },
}
