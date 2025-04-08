import { INFINITY_SUPPORTED_CHAINS } from '@pancakeswap/infinity-sdk'
import { InfoPageLayout } from 'views/InfinityInfo/components/Layout'
import Tokens from 'views/InfinityInfo/components/Tokens'

const InfoPage = () => {
  return <Tokens />
}

InfoPage.Layout = InfoPageLayout
InfoPage.chains = INFINITY_SUPPORTED_CHAINS

export default InfoPage
