import { useTranslation } from '@pancakeswap/localization'
import { Grid, Heading, PageHeader } from '@pancakeswap/uikit'
import Page from 'components/Layout/Page'
import PageLoader from 'components/Loader/PageLoader'
import { useAtomValue } from 'jotai'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { nftsBaseUrl } from 'views/Nft/market/constants'
import { pancakeCollectiblesAtom } from '../atom/pancakeCollectiblesAtom'

const CollectionCardWithVolume = dynamic(
  () => import('../../Nft/market/components/CollectibleCard/CollectionCardWithVolume'),
  { ssr: false },
)

const PancakeCollectiblesContent = () => {
  const { t } = useTranslation()
  const collections = useAtomValue(pancakeCollectiblesAtom)

  return (
    <>
      <PageHeader>
        <Heading as="h1" scale="xxl" color="secondary" data-test="nft-collections-title">
          {t('Pancake Collectibles')}
        </Heading>
      </PageHeader>
      <Page>
        <Grid
          gridGap="16px"
          gridTemplateColumns={['1fr', '1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
          mb="32px"
          data-test="nft-collection-row"
        >
          {collections.map((collection) => (
            <CollectionCardWithVolume
              key={collection.address}
              bgSrc={collection.banner.small}
              avatarSrc={collection.avatar}
              collectionName={collection.name}
              url={`${nftsBaseUrl}/collections/${collection.address}`}
              volume={collection.totalVolumeBNB ? parseFloat(collection.totalVolumeBNB) : 0}
            />
          ))}
        </Grid>
      </Page>
    </>
  )
}

const PancakeCollectibles = () => (
  <Suspense fallback={<PageLoader />}>
    <PancakeCollectiblesContent />
  </Suspense>
)

export default PancakeCollectibles
