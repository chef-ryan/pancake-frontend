import { ChainId } from '@pancakeswap/chains'
import IFO from '../../views/IfosV2/ifo'

const IfoV2Page = () => {
  return <IFO />
}
IfoV2Page.chains = [ChainId.BSC, ChainId.BSC_TESTNET]

export default IfoV2Page
