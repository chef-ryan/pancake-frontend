import { Address, beginCell, toNano } from '@ton/core'
import { TonContractNames, TonContractTypes } from 'ton/ton.enums'
import { ContractFactory } from 'ton/utils/ContractFactory'

interface RefundParams {
  userAddress: Address
  accountAddress: Address
}
export const msgRefund = async (params: RefundParams) => {
  const router = ContractFactory.getContract(TonContractNames.Router)
  const poolAddres = await router.getPoolAddress(params.accountAddress, params.userAddress)
  if (!poolAddres) {
    throw new Error('Pool address not found')
  }
  const poolContract = ContractFactory.getContract(TonContractTypes.Pool, poolAddres)
  const accountAddress = await poolContract.getLpAccountAddress(params.userAddress)
  if (!accountAddress) {
    throw new Error('LP Account address not found')
  }
  const lpContract = ContractFactory.getContract(TonContractTypes.LP, accountAddress)
  const [amount0, amount1] = await lpContract.getLPAccountData()

  // If there's any positive balance, build the Refund message
  if (amount0 > 0n || amount1 > 0n) {
    // Here, 4n represents the refund opcode or method ID – adjust per your actual contract
    const payload = beginCell().storeUint(4n, 64).endCell()

    // Create a message to be sent to the LP Account
    const message = {
      to: accountAddress,
      value: toNano('0.2'), // Example: send 0.2 TON to cover gas
      body: payload,
      init: null,
      // Typically, for a refund scenario, bounce can be set to false. Adjust based on your contract's logic.
      bounce: false,
    }

    return message
  }

  return null
}
