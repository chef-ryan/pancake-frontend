import dynamic from 'next/dynamic'
import LoadingData from 'public/images/animations/Loading_Lottie.json'
import LongSuccessData from 'public/images/animations/Long_Success_Lottie.json'
import ShortSuccessData from 'public/images/animations/Short_Success-Lottie.json'
import SubmitData from 'public/images/animations/Submit_Lottie.json'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

type AnimationType = 'loading' | 'longSuccess' | 'shortSuccess' | 'submit'

interface TransactionAnimationsProps {
  type: AnimationType
  width?: string
}

const DEFAULT_WIDTH = '36px'

export const TransactionAnimation = ({ type, width = DEFAULT_WIDTH }: TransactionAnimationsProps) => {
  switch (type) {
    case 'loading':
      return <Lottie animationData={LoadingData} style={{ width }} />
    case 'longSuccess':
      return <Lottie loop={false} animationData={LongSuccessData} style={{ width, marginTop: '-12px' }} />
    case 'shortSuccess':
      return <Lottie loop={false} animationData={ShortSuccessData} style={{ width, marginTop: '-12px' }} />
    case 'submit':
      return <Lottie loop={false} animationData={SubmitData} style={{ width }} />
    default:
      return null
  }
}
