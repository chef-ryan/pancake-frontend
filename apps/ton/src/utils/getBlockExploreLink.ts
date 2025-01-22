import { blockExplorerUrl } from 'config/constants/endpoints'

export function getBlockExplorerLink(
  data: string | number | undefined | null,
  type: 'transaction' | 'token' | 'address' | 'block' | 'countdown',
): string {
  switch (type) {
    case 'transaction': {
      return `${blockExplorerUrl}/tx/${data}`
    }
    case 'token': {
      return `${blockExplorerUrl}/jetton/${data}`
    }
    case 'block': {
      return `${blockExplorerUrl}/block/${data}`
    }
    case 'countdown': {
      return `${blockExplorerUrl}/block/countdown/${data}`
    }
    default: {
      return `${blockExplorerUrl}/address/${data}`
    }
  }
}
