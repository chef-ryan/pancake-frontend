import dynamic from 'next/dynamic'
import PancakeCollectiblesPageRouter from 'views/Profile/components/PancakeCollectiblesPageRouter'

const Page = dynamic(() => Promise.resolve(PancakeCollectiblesPageRouter), { ssr: false })

export default Page
