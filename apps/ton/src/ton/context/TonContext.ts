import { TonClient } from '@ton/ton'
import { tonState } from 'ton/atom/context/tonStateAtom'
import { TonContextEvents } from 'ton/ton.enums'
import { Emiter } from 'ton/utils/Emiter'
import { TonEndPoints } from './endpoints'

export class TonContext extends Emiter<TonContextEvents> {
  private tonClient?: TonClient

  constructor() {
    super()
    const network = tonState.network
    this.tonClient = new TonClient({ endpoint: TonEndPoints[network] })
  }

  public getClient() {
    return this.tonClient!
  }

  public static instance = new TonContext()
}
