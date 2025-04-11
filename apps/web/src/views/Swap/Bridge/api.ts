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
    const resp = await fetch(`${BRIDGE_API_ENDPOINT}/v1/calldata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputToken: currencyAmountIn.currency.wrapped.address,
        outputToken: currencyAmountOut.currency.wrapped.address,
        inputAmount: currencyAmountIn.quotient.toString(),
        originChainId: currencyAmountIn.currency.chainId,
        destinationChainId: currencyAmountOut.currency.chainId,
        commands: [
          {
            command: 'BRIDGE',
            data: {
              inputToken: currencyAmountIn.currency.wrapped.address,
              outputToken: currencyAmountOut.currency.wrapped.address,
              inputAmount: currencyAmountIn.quotient.toString(),
              originChainId: currencyAmountIn.currency.chainId,
              destinationChainId: currencyAmountOut.currency.chainId,
              originChainRecipient: recipient,
              destinationChainRecipient: recipient,
              // TODO: replace with minOutputAmount from the response or Backend will calculate it
              minOutputAmount: '1',
            },
          },
        ],
      }),
    })

    const data = (await resp.json()) as GetBridgeCalldataResponse
    return data
  } catch (error) {
    console.error('error', error)
    throw error
  }
}

export type PostBridgeCheckApprovalResponse = {
  approval: {
    to: `0x${string}`
    value: `0x${string}`
    from: `0x${string}`
    data: `0x${string}`
  } | null
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
        token: currencyAmountIn.currency.wrapped.address,
        amount: currencyAmountIn.quotient.toString(),
        chainId: currencyAmountIn.currency.chainId,
      }),
    })

    const data = (await resp.json()) as PostBridgeCheckApprovalResponse
    return data
  } catch (error) {
    console.error('error', error)
    throw error
  }
}
