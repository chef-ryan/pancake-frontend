import dynamic from 'next/dynamic'
import TeamPageRouter from 'views/Teams/TeamPageRouter'

const Page = dynamic(() => Promise.resolve(TeamPageRouter), { ssr: false })

export default Page
