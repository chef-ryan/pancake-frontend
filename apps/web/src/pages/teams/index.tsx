import dynamic from 'next/dynamic'
import Teams from '../../views/Teams'

const Page = dynamic(() => Promise.resolve(Teams), { ssr: false })

export default Page
