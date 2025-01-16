import { getHttpEndpoint } from '@orbs-network/ton-access'
import { TonClient } from '@ton/ton'
import { tonState } from 'ton/atom/tonStateAtom'
import { TonContextEvents, TonNetworks } from 'ton/ton.enums'
import { Emiter } from 'ton/utils/Emiter'

export class TonContext extends Emiter<TonContextEvents> {
  private tonClient?: TonClient

  constructor() {
    super()

    const { network } = tonState

    getHttpEndpoint({ network: network === TonNetworks.Mainnet ? 'mainnet' : 'testnet' }).then((endpoint) => {
      this.tonClient = new TonClient({ endpoint })
    })
  }

  public getClient() {
    return this.tonClient!
  }

  public static instance = new TonContext()
}
