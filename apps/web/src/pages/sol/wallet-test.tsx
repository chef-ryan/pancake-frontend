import { FlexGap } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Page from 'components/Layout/Page'
import dynamic from 'next/dynamic'

const SolanaProviders = dynamic(() => import('../../sol/provider').then((m) => m.SolProvider), {
  ssr: false,
})
export default function WalletTest() {
  return (
    <SolanaProviders>
      <Page>
        <FlexGap gap="16px">
          <ConnectWalletButton>Connect EVM Wallet</ConnectWalletButton>
        </FlexGap>
      </Page>
    </SolanaProviders>
  )
}
