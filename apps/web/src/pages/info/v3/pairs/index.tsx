import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'pages/type'
import Pools from 'views/V3Info/views/PoolsPage'
import { InfoPageLayout } from 'views/V3Info/components/Layout'

const InfoPoolsPage = () => {
  return <Pools />
}

const Page = dynamic(() => Promise.resolve(InfoPoolsPage), {
  ssr: false,
}) as NextPageWithLayout

Page.Layout = InfoPageLayout
Page.chains = [] // set all

export default Page
