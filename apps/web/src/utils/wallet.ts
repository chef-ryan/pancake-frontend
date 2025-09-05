import { Connector } from 'wagmi'

export const checkWalletCanRegisterToken = async (connector: Connector) => {
  try {
    if (typeof connector.getProvider !== 'function') return false

    const provider = (await connector.getProvider()) as any

    return (
      !!provider?.request &&
      typeof provider.request === 'function' &&
      // Some providers throw if they don’t support it
      (await provider
        .request({ method: 'wallet_watchAsset', params: { type: 'ERC20', options: {} } })
        .then(() => true)
        .catch(() => true)) // they support the method even if the dummy call fails
    )
  } catch (error: any) {
    // If the provider rejects "unknown method", it doesn’t support asset registration
    if (error?.code === -32601) return false
    console.error(error, 'Error while checking wallet token registration support')
    return false
  }
}
