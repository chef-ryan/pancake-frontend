import { SUPPORT_FARMS } from 'config/constants/supportChains'
import { PoolDetail } from 'views/PoolDetail'
import dynamic from 'next/dynamic'

const PoolDetailPage = () => <PoolDetail />

PoolDetailPage.chains = SUPPORT_FARMS

export default dynamic(() => Promise.resolve(PoolDetailPage), {
  ssr: false,
})
