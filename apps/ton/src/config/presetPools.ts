import { TonNetworks } from '@pancakeswap/ton-v2-sdk'
// import testnetPools from 'public/lists/pools-testnet.json'

export const PRESET_POOLS = {
  [TonNetworks.Mainnet]: [],
  [TonNetworks.Testnet]: {
    // ...testnetPools,
    // PAN-TON
    'kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg<>kQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffAw5':
      'EQD_Lx2fpT3CDX16OzHWu4utvHkMqk4cww65uN53js4WY5Au',
    // TON-USDC
    'kQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffAw5<>kQBN6HSn7GmAB30K_YmL3vhS2ms5LMm9aPW0PGzvUZASRzng':
      'EQDINV8OA01yK-fmAECxCXwskiQI_A5GAZYRBDnPhvrmzD8Y',
    // TON-SYRUP
    'kQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffAw5<>kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F':
      'EQCXqIbJ_Dq9cKa8p8WjAb2X9iM_d_72QPNOdU7cKUIcXEqg',
    // RUBY-USDC
    'kQBN6HSn7GmAB30K_YmL3vhS2ms5LMm9aPW0PGzvUZASRzng<>kQDrYGRT12rOkdJFFvtDIS5xS_tnatlTEO55hnkClQYAv0q3':
      'kQArNuzh9UZ3zZY28m2CwHfgIfKsP900sWyZ1tYXl3Evt_Gj',
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
    // SYRUP-USDC
    'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F<>kQBN6HSn7GmAB30K_YmL3vhS2ms5LMm9aPW0PGzvUZASRzng':
      'EQAOBiyyQ66AUj3hq2Cy9RQIN-km5gdjxXz5zs_Dl0kACe8W',
    // SYRUP-Jet
    'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F<>kQCj6VUXJ2ydAOdxrhsiuU4pU0PPQ2nbHxhsTlBHkrOraY4z':
      'EQBTknTRiOS4mFPqpctzueEVjo2UQum0aIbsq9MEpLCZjdMX',
    // Jet-RB4
    'kQCj6VUXJ2ydAOdxrhsiuU4pU0PPQ2nbHxhsTlBHkrOraY4z<>kQAFlRlDdSoVFSXX9j7EcudkTedrix7JEVbjfps9oFXnIyJ9':
      'EQBgNjuZQ-G18kDCF3VfQXZYYEUpiYh_-rDh6B3YfU5jCETm',
    // JET-RB4
    'EQAiihOa4xLY1gDK55C6LzSU5cRImwXJMmIKkjQ5T5e1wr85<>kQAFlRlDdSoVFSXX9j7EcudkTedrix7JEVbjfps9oFXnIyJ9':
      'EQDE_tbygSmE01uVhPQ0nsMT1lbFftuzx4SXJ0AAIFi8TFKo',
    // TON-JET
    'kQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffAw5<>EQAiihOa4xLY1gDK55C6LzSU5cRImwXJMmIKkjQ5T5e1wr85':
      'EQDsCbNuMFhlsyJlkSMQ2WNPLxY9Z1dXpeG4rKya2ypRzsHu',
  },
}
