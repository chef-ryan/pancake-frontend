import { useSolanaUserSlippage } from '@pancakeswap/utils/user'
import { SlippageTabsComponent } from 'components/Menu/GlobalSettings/TransactionSettings'

export const SlippageTabs = () => {
  const [userSlippageTolerance, setUserSlippageTolerance] = useSolanaUserSlippage()

  return (
    <SlippageTabsComponent slippageTolerance={userSlippageTolerance} setSlippageTolerance={setUserSlippageTolerance} />
  )
}
