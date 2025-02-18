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

export const TransactionAnimation = ({ type, width }: TransactionAnimationsProps) => {
  switch (type) {
    case 'loading':
      return <Lottie animationData={LoadingData} style={{ width: width || '50px' }} />
    case 'longSuccess':
      return <Lottie animationData={LongSuccessData} style={{ width: width || '50px' }} />
    case 'shortSuccess':
      return <Lottie animationData={ShortSuccessData} style={{ width: width || '50px' }} />
    case 'submit':
      return <Lottie animationData={SubmitData} style={{ width: width || '50px' }} />
    default:
      return null
  }
}
