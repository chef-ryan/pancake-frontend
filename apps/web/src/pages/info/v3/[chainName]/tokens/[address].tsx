import { GetStaticPaths, GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import { getTokenStaticPaths, getTokenStaticProps } from 'utils/pageUtils'
import { InfoPageLayout } from 'views/V3Info/components/Layout'

const Token = dynamic(() => import('views/V3Info/views/TokenPage'), { ssr: false })

const TokenPage = ({ address }: { address: string }) => {
  if (!address) {
    return null
  }

  return <Token address={address.toLowerCase()} />
}

TokenPage.Layout = InfoPageLayout
TokenPage.chains = [] // set all

export default TokenPage

export const getStaticPaths: GetStaticPaths = getTokenStaticPaths()

export const getStaticProps: GetStaticProps = getTokenStaticProps()
