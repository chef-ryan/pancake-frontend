/* eslint-disable react/no-unescaped-entities */
import { ChainId } from '@pancakeswap/chains'
import { Trans } from '@pancakeswap/localization'
import { ASSET_CDN } from 'config/constants/endpoints'
import { IFOConfig } from '../ifov2.types'

export const ifoConfigs: IFOConfig[] = [
  // TODO: IFO v10 testing configuration on Tenderly Virtual Network
  {
    id: 'ifo-presale',
    icon: 'https://proofs.pancakeswap.com/cms/uploads/27729a23a3b3e0e5ab75da585f04217c4b036b0f92b54bf6a7393afe1f157be6.png', // TODO: Replace with actual icon
    projectUrl: 'https://pancakeswap.finance/',
    chainId: ChainId.BSC,
    bannerUrl: `https://proofs.pancakeswap.com/cms/uploads/495262706d9d431db12f564544d807e4b8d1e7f39e8b26b170d16f6a26212987.png`, // TODO: Replace with actual banner
    contractAddress: '0x6a6c090C01DCF31983c484B9b5b54b0B53D97d5F', // IFO v10 contract address
    tgeTitle: <Trans>IFO v10 Test - USDT Offering</Trans>,
    tgeSubtitle: <Trans>Testing on Tenderly Virtual Network</Trans>,
    description: (
      <div>
        <Trans>This is a test IFO v10 configuration for development and testing purposes.</Trans>
      </div>
    ),
    faqs: [
      {
        title: <Trans>1. Test Environment Notice</Trans>,
        description: (
          <Trans>
            This is a test IFO running on Tenderly Virtual Network. All transactions are simulated and not on mainnet.
          </Trans>
        ),
      },
      {
        title: <Trans>2. How to participate?</Trans>,
        description: (
          <>
            <Trans>
              You can participate using BNB (Native Token) to purchase USDT tokens during the offering period.
            </Trans>
            <br />
            <Trans>Start: {new Date(1756266834 * 1000).toLocaleString()}</Trans>
            <br />
            <Trans>End: {new Date(1756349634 * 1000).toLocaleString()}</Trans>
          </>
        ),
      },
      {
        title: <Trans>3. Token Distribution</Trans>,
        description: (
          <Trans>
            Tokens will be distributed immediately after the IFO ends. No vesting period is enabled for this test.
          </Trans>
        ),
      },
    ],
  },
  {
    id: 'ifo-test01',
    icon: '/images/ifo/test.png', // TODO: Replace with actual icon
    projectUrl: 'https://pancakeswap.finance/',
    chainId: ChainId.BSC,
    bannerUrl: `${ASSET_CDN}/web/ido/myshell-banner.png`, // TODO: Replace with actual banner
    contractAddress: '0xd00528C3a3AEB599c9dB517787BF024aBD4fE65c', // IFO v10 contract address
    tgeTitle: <Trans>IFO v10 Test - USDT Offering</Trans>,
    tgeSubtitle: <Trans>Testing on Tenderly Virtual Network</Trans>,
    description: (
      <>
        <Trans>This is a test IFO v10 configuration for development and testing purposes.</Trans>
        <br />
        <br />
        <b>Virtual Network Details:</b>
        <br />
        - LP Token 0: Native Token (BNB)
        <br />
        - Offering Token: USDT (0x55d398326f99059fF775485246999027B3197955)
        <br />
        - Admin: 0xbe9c4b9bbf22a2ef48d2ba0ee177168db6d46363
        <br />- Start Time: {new Date(1756266834 * 1000).toLocaleString()}
        <br />- End Time: {new Date(1756349634 * 1000).toLocaleString()}
        <br />
        - Pool Mode: Single Pool (maxPoolId = 0)
        <br />- Vesting: Disabled
      </>
    ),
    faqs: [
      {
        title: <Trans>1. Test Environment Notice</Trans>,
        description: (
          <Trans>
            This is a test IFO running on Tenderly Virtual Network. All transactions are simulated and not on mainnet.
          </Trans>
        ),
      },
      {
        title: <Trans>2. How to participate?</Trans>,
        description: (
          <>
            <Trans>
              You can participate using BNB (Native Token) to purchase USDT tokens during the offering period.
            </Trans>
            <br />
            <Trans>Start: {new Date(1756266834 * 1000).toLocaleString()}</Trans>
            <br />
            <Trans>End: {new Date(1756349634 * 1000).toLocaleString()}</Trans>
          </>
        ),
      },
      {
        title: <Trans>3. Token Distribution</Trans>,
        description: (
          <Trans>
            Tokens will be distributed immediately after the IFO ends. No vesting period is enabled for this test.
          </Trans>
        ),
      },
    ],
  },
  {
    id: 'ifo test-02',
    icon: '/images/ifo/myshell.png',
    projectUrl: 'https://myshell.ai/',
    chainId: ChainId.BSC,
    bannerUrl: `${ASSET_CDN}/web/ifo/myshell-banner.png`,
    contractAddress: '0xcE6B19a9d0f83F5a4F098B99870f513FCA6133Df',
    tgeTitle: <Trans>MyShell's Token Generation Event</Trans>,
    tgeSubtitle: undefined,
    description: (
      <Trans>
        MyShell is an AI creator platform for everyone to build, share, and own AI agents. Our vision is to create a
        unified platform that provides product-driven value for web2 users and offers the crypto community participating
        ownership in practical AI applications, bridging the gap between frontier AI applications and blockchain
        technology.
      </Trans>
    ),
  },
]
