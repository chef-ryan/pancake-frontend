import { TonChainId, TonContextEvents, TonNetworks } from '@pancakeswap/ton-v2-sdk'
import { TonClient } from '@ton/ton'
import { tonState } from 'ton/atom/tonStateAtom'
import { Emiter } from 'ton/utils/Emiter'
import { TonEndPoints } from './endpoints'

export class TonContext extends Emiter<TonContextEvents> {
  private tonClient?: TonClient

  constructor() {
    super()

    const { network } = tonState
    const chainId = network === TonNetworks.Mainnet ? TonChainId.Mainnet : TonChainId.Testnet

    this.tonClient = new TonClient({ endpoint: TonEndPoints[chainId] })
  }

  public getClient() {
    return this.tonClient ?? ({} as unknown as TonClient)
  }

  public static instance = new TonContext()
}
