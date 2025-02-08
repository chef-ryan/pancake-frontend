import { blockExplorerUrls } from 'config/constants/endpoints'
import { TonNetworks } from 'ton/ton.enums'

export function getBlockExplorerLink(
  data: string | number | undefined | null,
  type: 'transaction' | 'token' | 'address' | 'block' | 'countdown',
  network = TonNetworks.Mainnet,
): string {
  switch (type) {
    case 'transaction': {
      return `${blockExplorerUrls[network]}/tx/${data}`
    }
    case 'token': {
      return `${blockExplorerUrls[network]}/jetton/${data}`
    }
    case 'block': {
      return `${blockExplorerUrls[network]}/block/${data}`
    }
    case 'countdown': {
      return `${blockExplorerUrls[network]}/block/countdown/${data}`
    }
    default: {
      return `${blockExplorerUrls[network]}/address/${data}`
    }
  }
}
