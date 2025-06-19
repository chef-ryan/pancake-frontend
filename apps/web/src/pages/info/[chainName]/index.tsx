import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'pages/type'
import { InfoPageLayout } from 'views/Info'
import Overview from 'views/Info/Overview'

const MultiChainPage = () => {
  return <Overview />
}

const Page = dynamic(() => Promise.resolve(MultiChainPage), {
  ssr: false,
}) as NextPageWithLayout

Page.Layout = InfoPageLayout
Page.chains = []

export default Page
