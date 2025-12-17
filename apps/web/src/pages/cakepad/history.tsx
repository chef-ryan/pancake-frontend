import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import PastIfo from 'views/Ifos/PastIfo'
import { PageMeta } from 'components/Layout/Page'
import { useIfoConfigs } from 'views/Cakepad/hooks/useIfoConfigs'
import { IFO_SUPPORT_CHAINS } from 'config/cakepad.config'

const View = () => {
  useIfoConfigs()

  return (
    <>
      <PageMeta />
      <PastIfo isV2 />
    </>
  )
}
const PastIfoPage = dynamic(() => Promise.resolve(View), {
  ssr: false,
}) as NextPageWithLayout

PastIfoPage.chains = [...IFO_SUPPORT_CHAINS]

export default PastIfoPage
