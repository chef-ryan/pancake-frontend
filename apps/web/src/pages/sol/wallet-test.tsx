import { FlexGap } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Page from 'components/Layout/Page'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import dynamic from 'next/dynamic'
import { CHAIN_IDS } from 'utils/wagmi'
import SolanaConnectButton from 'wallet/components/SolanaConnectButton'
import SolanaDisconnectButton from 'wallet/components/SolanaDisconnectButton'

const SolanaProviders = dynamic(() => import('../../wallet/solanaProvider').then((m) => m.SolProvider), {
  ssr: false,
})
export default function WalletTest() {
  const { chainId, account, solanaAccount, isWrongNetwork } = useAccountActiveChain()
  return (
    <SolanaProviders>
      <Page>
        <p>activeChainId: {chainId}</p>
        <p>account: {account}</p>
        <p>solanaAccount: {solanaAccount}</p>
        <p>isWrongNetowork: {Boolean(isWrongNetwork)}</p>
        <FlexGap gap="16px">
          <ConnectWalletButton>Connect EVM Wallet</ConnectWalletButton>
          <SolanaConnectButton>Connect Solana</SolanaConnectButton>
          <SolanaDisconnectButton>Disconnect Solana</SolanaDisconnectButton>
        </FlexGap>
      </Page>
    </SolanaProviders>
  )
}

WalletTest.chains = CHAIN_IDS
