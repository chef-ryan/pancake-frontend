export interface ResultJettonData {
  mintable: boolean
  total_supply: string
  admin: ResultAdmin
  metadata: ResultJettonMetadata
  preview: string
  verification: string
  holders_count: number
}

interface ResultAdmin {
  address: string
  is_scam: boolean
  is_wallet: boolean
}

interface ResultJettonMetadata {
  address: string
  name: string
  symbol: string
  decimals: string
  image: string
}
