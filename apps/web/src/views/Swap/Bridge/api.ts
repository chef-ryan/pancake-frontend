import { Currency, CurrencyAmount } from '@pancakeswap/sdk'
import { BRIDGE_API_ENDPOINT } from 'config/constants/endpoints'
import { Address } from 'viem/accounts'

export type GetBridgeCalldataResponse = {
  transactionData: {
    router: Address
    calldata: `0x${string}`
  }
  gasFee: string
}

enum Command {
  BRIDGE = 'BRIDGE',
  SWAP = 'SWAP',
}

interface BridgeDataSchema {
  command: Command.BRIDGE
  data: {
    inputToken: Address
    outputToken: Address
    inputAmount: string
    minOutputAmount?: string
    originChainId: number
    destinationChainId: number
    originChainRecipient: Address
    destinationChainRecipient?: Address
  }
}

interface SwapDataSchema {
  command: Command.SWAP
  data: {
    originChainId: number
    trade: any
    slippageTolerance: number
    deadlineOrPreviousBlockhash?: string
    recipient?: Address
  }
}

interface CalldataRequestSchema {
  inputToken: Address
  outputToken: Address
  inputAmount: string
  originChainId: number
  destinationChainId: number
  recipientOnDestChain: Address
  commands: (BridgeDataSchema | SwapDataSchema)[]
}

function getTokenAddress(currency: Currency): Address {
  return currency.isNative ? '0x0000000000000000000000000000000000000000' : currency.wrapped.address
}

export const getBridgeCalldata = async ({
  currencyAmountIn,
  currencyAmountOut,
  recipient,
}: {
  currencyAmountIn: CurrencyAmount<Currency>
  currencyAmountOut: CurrencyAmount<Currency>
  recipient: Address
}) => {
  try {
    const bridgeCommand: BridgeDataSchema = {
      command: Command.BRIDGE,
      data: {
        inputToken: getTokenAddress(currencyAmountIn.currency),
        outputToken: getTokenAddress(currencyAmountOut.currency),
        inputAmount: currencyAmountIn.quotient.toString(),
        originChainId: currencyAmountIn.currency.chainId,
        destinationChainId: currencyAmountOut.currency.chainId,
        originChainRecipient: recipient,
        destinationChainRecipient: recipient,
        // TODO: replace with minOutputAmount from the response or Backend will calculate it
        minOutputAmount: '1',
      },
    }

    const calldataRequest: CalldataRequestSchema = {
      inputToken: getTokenAddress(currencyAmountIn.currency),
      outputToken: getTokenAddress(currencyAmountOut.currency),
      inputAmount: currencyAmountIn.quotient.toString(),
      originChainId: currencyAmountIn.currency.chainId,
      destinationChainId: currencyAmountOut.currency.chainId,
      recipientOnDestChain: recipient,
      commands: [bridgeCommand],
    }

    const resp = await fetch(`${BRIDGE_API_ENDPOINT}/v1/calldata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calldataRequest),
    })

    const data = (await resp.json()) as GetBridgeCalldataResponse
    return data
  } catch (error) {
    console.error('getBridgeCalldata Error', error)
    throw error
  }
}

export type PostBridgeCheckApprovalResponse = {
  approval: {
    isRequired: boolean
    to: `0x${string}`
    value: `0x${string}`
    from: `0x${string}`
    data: `0x${string}`
  }
}

export const postBridgeCheckApproval = async ({
  currencyAmountIn,
  recipient,
}: {
  currencyAmountIn: CurrencyAmount<Currency>
  recipient: Address
}) => {
  try {
    const resp = await fetch(`${BRIDGE_API_ENDPOINT}/v1/check-approval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: recipient,
        token: getTokenAddress(currencyAmountIn.currency),
        amount: currencyAmountIn.quotient.toString(),
        chainId: currencyAmountIn.currency.chainId,
      }),
    })

    const data = (await resp.json()) as PostBridgeCheckApprovalResponse
    return data
  } catch (error) {
    console.error('postBridgeCheckApproval Error', error)
    throw error
  }
}
