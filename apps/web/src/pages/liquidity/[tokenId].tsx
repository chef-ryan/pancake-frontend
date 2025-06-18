import { CHAINS } from 'config/chains'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { PageWithoutFAQ } from 'views/Page'

const LiquidityView = dynamic(() => import('views/Liquidity/LiquidityView').then((mod) => mod.LiquidityView), {
  ssr: false,
})

export default function PoolPage() {
  const router = useRouter()
  const { tokenId } = router.query

  useEffect(() => {
    const isNumberReg = /^\d+$/

    if (tokenId && typeof tokenId === 'string' && !tokenId.match(isNumberReg)) {
      router.replace('/add')
    }
  }, [tokenId, router])

  return <LiquidityView />
}

PoolPage.chains = CHAINS.map((chain) => chain.id)
PoolPage.screen = true
PoolPage.Layout = PageWithoutFAQ
