import { getHttpEndpoint } from '@orbs-network/ton-access'
import { TonContextEvents, TonNetworks } from '@pancakeswap/ton-v2-sdk'
import { TonClient } from '@ton/ton'
import { tonState } from 'ton/atom/tonStateAtom'
import { Emiter } from 'ton/utils/Emiter'
import { TonEndPoints } from './endpoints'

export class TonContext extends Emiter<TonContextEvents> {
  private tonClient?: TonClient

  constructor() {
    super()

    const { network } = tonState

    this.tonClient = new TonClient({ endpoint: TonEndPoints[network] })
    getHttpEndpoint({ network: network === TonNetworks.Mainnet ? 'mainnet' : 'testnet' }).then((endpoint) => {
      this.tonClient = new TonClient({ endpoint })
    })
  }

  public getClient() {
    return this.tonClient ?? ({} as unknown as TonClient)
  }

  public static instance = new TonContext()
}
