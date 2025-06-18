import { Box } from '@pancakeswap/uikit'
import dynamic from 'next/dynamic'
import PageLoader from 'components/Loader/PageLoader'
import { SelectIdRoute } from 'dynamicRoute'
import { useDefaultSelectIdRoute, useSelectIdRoute } from 'hooks/dynamicRoute/useSelectIdRoute'
import { CHAIN_IDS } from 'utils/wagmi'
import { CreateLiquidityInfinityForm } from 'views/CreateLiquidityPool'

export type RouteType = typeof SelectIdRoute

const CreateLiquidityPage = () => {
  const { routeParams } = useSelectIdRoute()
  useDefaultSelectIdRoute()

  if (!routeParams) {
    return <PageLoader />
  }

  return (
    <Box my="24px">
      <CreateLiquidityInfinityForm />
    </Box>
  )
}

CreateLiquidityPage.chains = CHAIN_IDS
CreateLiquidityPage.screen = true

export default dynamic(() => Promise.resolve(CreateLiquidityPage), {
  ssr: false,
})
