import { storeJettonTransferMessage } from '@ton-community/assets-sdk'
import { Address, beginCell, Contract, toNano } from '@ton/core'
import { Contracts } from 'ton/def/contracts.def'
import { TON_OPCODES } from 'ton/opcodes'
import { TonContractNames } from 'ton/ton.enums'
import { generateQueryId } from 'ton/utils/generateQueryId'
import { JettonHelper } from 'ton/utils/JettonHelper'

export interface AddLiquidityParams {
  userAddress: Address
  jettonTokenAddress: Address
  inputAmount: bigint
  lpMinOut: bigint
}

const ADD_LIQUIDITY_VALUE = toNano(0.2)
const ADD_LIQUIDITY_FORWARD_VALUE = toNano(0.15)

export async function msgAddLiquidity({ userAddress, jettonTokenAddress, inputAmount, lpMinOut }: AddLiquidityParams) {
  const router = Contracts[TonContractNames.Router]
  const routerJettonWallet = await JettonHelper.getJettonWallet(jettonTokenAddress, TonContractNames.Router)
  const queryId = generateQueryId(userAddress)

  // Create the forward payload
  const forwardPayload = beginCell()
    .storeUint(TON_OPCODES.PROVIDE_LP, 32)
    .storeAddress(routerJettonWallet)
    .storeCoins(lpMinOut)
    .endCell()

  // Create the main payload
  const payload = beginCell()
    .store(
      storeJettonTransferMessage({
        queryId,
        amount: inputAmount,
        destination: Address.parse(router.address),
        responseDestination: userAddress,
        customPayload: null,
        forwardAmount: ADD_LIQUIDITY_FORWARD_VALUE,
        forwardPayload,
      }),
    )
    .endCell()

  // Create the external message
  const message = {
    to: routerJettonWallet,
    value: ADD_LIQUIDITY_VALUE,
    body: payload,
    init: null,
    bounce: true,
  }

  return message
}
