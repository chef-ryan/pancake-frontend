import { ChainId } from '@pancakeswap/chains'
import { useRouter } from 'next/router'
import { NextPageWithLayout } from 'utils/page.types'
import IfoLayout from 'views/IfosV2/components/IfoLayout'
import { IfoV2Provider } from 'views/IfosV2/contexts/IfoV2Context'
import { IfoDeposit } from 'views/IfosV2/components/IfoDeposit'

const IfoDepositPage: NextPageWithLayout = () => {
  const { query } = useRouter()
  const { ifoId, poolIndex } = query

  if (typeof ifoId !== 'string' || typeof poolIndex !== 'string') {
    return null
  }

  return (
    <IfoV2Provider id={ifoId}>
      <IfoDeposit pid={Number(poolIndex)} />
    </IfoV2Provider>
  )
}

IfoDepositPage.chains = [ChainId.BSC, ChainId.BSC_TESTNET]
IfoDepositPage.Layout = IfoLayout

export default IfoDepositPage
