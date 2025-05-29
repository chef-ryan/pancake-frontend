import dynamic from 'next/dynamic'

const Swap = dynamic(() => import('@/features/JupiterSwap'), {
  ssr: false
})

function SwapPage() {
  return <Swap />
}

export default SwapPage
