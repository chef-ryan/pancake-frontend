export enum ORDER_CATEGORY {
  Existing = 3,
}

export interface ExistingOrder {
  transactionHash: string
  module: string
  inputToken: string
  owner: string
  witness: string
  data: string
}
