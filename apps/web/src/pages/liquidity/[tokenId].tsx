import { Card } from '@pancakeswap/uikit'
import { GetStaticPaths, GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import styled from 'styled-components'
import { CHAIN_IDS } from 'utils/wagmi'
import { PageWithoutFAQ } from 'views/Page'

const LiquidityView = dynamic(() => import('views/Liquidity/LiquidityView').then((mod) => mod.LiquidityView), {
  ssr: false,
})

export default function PoolPage() {
  return <LiquidityView />
}

PoolPage.chains = CHAIN_IDS
PoolPage.screen = true
PoolPage.Layout = PageWithoutFAQ

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const tokenId = params?.tokenId

  const isNumberReg = /^\d+$/

  if (tokenId && !(tokenId as string)?.match(isNumberReg)) {
    return {
      redirect: {
        statusCode: 307,
        destination: '/add',
      },
    }
  }

  return {
    props: {},
  }
}
