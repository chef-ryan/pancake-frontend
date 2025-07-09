import { FlexGap } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Page from 'components/Layout/Page'
import dynamic from 'next/dynamic'
import { CHAIN_IDS } from 'utils/wagmi'
import SolanaConnectButton from 'wallet/components/SolanaConnectButton'

const SolanaProviders = dynamic(() => import('../../wallet/solanaProvider').then((m) => m.SolProvider), {
  ssr: false,
})
export default function WalletTest() {
  return (
    <SolanaProviders>
      <Page>
        <FlexGap gap="16px">
          <ConnectWalletButton>Connect EVM Wallet</ConnectWalletButton>
          <SolanaConnectButton>Connect Solana</SolanaConnectButton>
        </FlexGap>
      </Page>
    </SolanaProviders>
  )
}

WalletTest.chains = CHAIN_IDS
