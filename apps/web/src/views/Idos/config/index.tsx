import { ChainId } from '@pancakeswap/chains'
import { Trans } from '@pancakeswap/localization'
import { ASSET_CDN } from 'config/constants/endpoints'
import { ReactNode } from 'react'
import type { Address } from 'viem'

export type IDOFAQs = Array<{ title: ReactNode; description: ReactNode }>

export type IDOConfig = {
  id: string
  projectUrl: string
  chainId: ChainId
  bannerUrl: string
  tgeTitle: ReactNode
  tgeSubtitle: ReactNode
  description: ReactNode
  contractAddress: Address
  faqs?: IDOFAQs
}

export const idoConfigDict: Record<string, IDOConfig> = {
  myshell: {
    id: 'myshell',
    projectUrl: 'https://myshell.ai/',
    chainId: ChainId.BSC,
    bannerUrl: `${ASSET_CDN}/web/ido/myshell-banner.png`,
    contractAddress: '0x0D54115eF8474C48103A1e3b41464BF3dB00E4B2',
    // eslint-disable-next-line react/no-unescaped-entities
    tgeTitle: <Trans>MyShell's Token Generation Event</Trans>,
    tgeSubtitle: <Trans>Exclusively via Binance Keyless Wallet</Trans>,
    description: (
      <Trans>
        MyShell is an AI creator platform for everyone to build, share, and own AI agents. Our vision is to create a
        unified platform that provides product-driven value for web2 users and offers the crypto community participating
        ownership in practical AI applications, bridging the gap between frontier AI applications and blockchain
        technology.
      </Trans>
    ),
  },
  round2: {
    id: 'round2',
    projectUrl: 'https://pancakeswap.finance/',
    chainId: ChainId.BSC,
    bannerUrl: '/images/ido/ido-banner.png',
    contractAddress: '0x0000000000000000000000000000000000000000',
    tgeTitle: <Trans>Round 2 Token Generation Event</Trans>,
    tgeSubtitle: <Trans>Details coming soon</Trans>,
    description: <Trans>Round 2 is the next phase of our token generation events. Stay tuned for more details.</Trans>,
    faqs: [
      {
        // eslint-disable-next-line react/no-unescaped-entities
        title: <Trans>How's BNB subscribe works?</Trans>,
        description: <Trans>TBD</Trans>,
      },
      {
        title: <Trans>Which regions/countries are not allowed to participate in this event?</Trans>,
        description: (
          <>
            <Trans>
              Currently, we do not allow the following nationalities to participate in binance exclusive TGE:
            </Trans>
            <ul>
              <li>United States</li>
              <li>Cuba</li>
              <li>Iran</li>
              <li>North Korea</li>
              <li>Syria</li>
              <li>Belgium</li>
              <li>Bahrain</li>
              <li>Canada</li>
              <li>Netherlands</li>
              <li>Spain</li>
              <li>El Salvador</li>
              <li>Poland</li>
              <li>Kazakhstan</li>
              <li>UAE</li>
              <li>Australia</li>
              <li>Japan</li>
              <li>New Zealand</li>
              <li>South Africa</li>
              <li>Argentina</li>
              <li>Brazil</li>
              <li>Colombia</li>
              <li>Mexico</li>
              <li>Indonesia</li>
              <li>Thailand</li>
              <li>Turkey</li>
              <li>India</li>
            </ul>
          </>
        ),
      },
    ],
  },
}
