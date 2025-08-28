import { ChainId } from '@pancakeswap/chains'
import { IfoPageLayout } from '../../views/IfosV2'
import IFO from '../../views/IfosV2/ifo'
import IfoTabButtons from '../../views/IfosV2/components/IfoTabButtons'

const IfoV2Page = () => {
  return (
    <>
      <IfoTabButtons />
      <IFO />
    </>
  )
}

IfoV2Page.Layout = IfoPageLayout
IfoV2Page.chains = [ChainId.BSC, ChainId.BSC_TESTNET]
IfoV2Page.mp = true

export default IfoV2Page
