import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const InfoPageLayout = dynamic(() => import('views/V3Info/components/Layout').then((mod) => mod.InfoPageLayout), {
  ssr: false,
})
const Token = dynamic(() => import('views/V3Info/views/TokenPage'), { ssr: false })

const TokenPage = () => {
  const router = useRouter()
  const { address } = router.query
  if (!address) {
    return null
  }

  return <Token address={String(address).toLowerCase()} />
}

TokenPage.Layout = InfoPageLayout
TokenPage.chains = [] // set all

export default TokenPage
