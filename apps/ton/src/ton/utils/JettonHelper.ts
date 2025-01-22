import { Address } from '@ton/core'
import { Contracts } from 'ton/def/contracts.def'
import { TonContractNames, TonContractTypes } from 'ton/ton.enums'
import { ContractFactory } from './ContractFactory'

export class JettonHelper {
  static async getJettonWallet(minter: Address, owner: Address): Promise<Address>

  static async getJettonWallet(minter: Address, owner: TonContractNames): Promise<Address>

  static async getJettonWallet(minter: Address, owner: Address | TonContractNames): Promise<Address> {
    const minterContract = ContractFactory.getContract(TonContractTypes.JettonMinter, minter)

    // Introduce a new variable to avoid reassigning function parameter
    let resolvedOwner: Address
    if (typeof owner === 'number') {
      const ownerConfig = Contracts[owner]
      resolvedOwner = Address.parse(ownerConfig.address)
    } else {
      resolvedOwner = owner
    }

    const walletAddress = await minterContract.getWalletAddress(resolvedOwner)
    return walletAddress
  }
}
