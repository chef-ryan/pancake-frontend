import dynamic from 'next/dynamic'
import { MevLanding } from 'views/Mev'

const Page = dynamic(() => Promise.resolve(MevLanding), { ssr: false })

export default Page
