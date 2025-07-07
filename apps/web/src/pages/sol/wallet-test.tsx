import dynamic from 'next/dynamic'
import { FlexGap } from '@pancakeswap/uikit'
import Page from 'components/Layout/Page'
import ConnectWalletButton from 'components/ConnectWalletButton'

const SolanaProviders = dynamic(() => import('../../../../solana/src/provider').then((m) => m.Providers), {
  ssr: false,
})
const SolWallet = dynamic(() => import('../../../../solana/src/components/SolWallet').then((m) => m.default), {
  ssr: false,
})

export default function WalletTest() {
  return (
    <SolanaProviders>
      <Page>
        <FlexGap gap="16px">
          <ConnectWalletButton>Connect EVM Wallet</ConnectWalletButton>
          <SolWallet />
        </FlexGap>
      </Page>
    </SolanaProviders>
  )
}
