export const ASSET_CDN = process.env.NEXT_PUBLIC_ASSET_CDN || 'https://assets.pancakeswap.finance'
export const APEX_DOMAIN = process.env.NEXT_PUBLIC_APEX_URL || 'https://pancakeswap.finance'
const parseRPCConf = () => {
  const fallback = [
    {
      url: 'https://api.mainnet-beta.solana.com',
      weight: 0,
      batch: true,
      name: ''
    }
  ]

  try {
    const rpcFromEnvVars = JSON.parse(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT_CONF ?? '[]')
    if (rpcFromEnvVars && rpcFromEnvVars.length) {
      return rpcFromEnvVars
    }
    return fallback
  } catch (e) {
    return fallback
  }
}

export const rpcs = parseRPCConf()
