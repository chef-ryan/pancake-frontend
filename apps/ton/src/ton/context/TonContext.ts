import { TonChainId, TonContextEvents, TonNetworks } from '@pancakeswap/ton-v2-sdk'
import { TonClient } from '@ton/ton'
import axios, { AxiosAdapter, getAdapter } from 'axios'
import { createStore } from 'jotai'
import { tonState } from 'ton/atom/tonStateAtom'
import { Emiter } from 'ton/utils/Emiter'
import { TonEndPoints } from './endpoints'

export class TonContext extends Emiter<TonContextEvents> {
  private tonClient?: TonClient

  constructor() {
    super()

    const { network } = tonState
    const chainId = network === TonNetworks.Mainnet ? TonChainId.Mainnet : TonChainId.Testnet

    // Remove X-Ton-Client-Version header for QuickNode Mainnet RPC
    const adapter: AxiosAdapter = (config) => {
      const newConfig = { ...config }
      delete newConfig.headers['X-Ton-Client-Version']
      return getAdapter(axios.defaults.adapter)(newConfig)
    }

    this.tonClient = new TonClient({
      endpoint: TonEndPoints[chainId],
      httpAdapter: network === TonNetworks.Mainnet ? adapter : undefined,
    })
  }

  public getClient() {
    return this.tonClient ?? ({} as unknown as TonClient)
  }

  public static instance = new TonContext()
}

export const atomStore = createStore()
