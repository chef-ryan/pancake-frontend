import { NextPageWithLayout } from 'utils/page.types'
import IfoLayout from 'views/Cakepad/components/IfoLayout'
import Hero from 'views/Cakepad/components/Hero'
import dynamic from 'next/dynamic'
import IFO from 'views/Cakepad/ifo'
import { PageMeta } from 'components/Layout/Page'
import { useIfoConfigs } from 'views/Cakepad/hooks/useIfoConfigs'
import { IFO_SUPPORT_CHAINS } from 'config/cakepad.config'
import { IfoV2Provider } from 'views/Cakepad/contexts/IfoV2Provider'

const View = () => {
  useIfoConfigs()

  return (
    <>
      <PageMeta />
      <IfoV2Provider>
        <Hero />
        <IFO />
      </IfoV2Provider>
    </>
  )
}

const CurrentIfoPage: NextPageWithLayout = dynamic(() => Promise.resolve(View), {
  ssr: false,
})

CurrentIfoPage.chains = IFO_SUPPORT_CHAINS
CurrentIfoPage.Layout = IfoLayout

export default CurrentIfoPage
