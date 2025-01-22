import { useAtomValue } from 'jotai'
import { addressAtom } from 'ton/atom/context/addressAtom'
import { isConnectedAtom } from 'ton/atom/context/isConnectedAtom'
import { balanceOfAtom } from 'ton/atom/logic/balanceOfAtom'
import { routerGasEstimationAtom } from 'ton/atom/logic/routerGasEstimationAtom'
import { TonContractNames } from 'ton/ton.enums'

export default () => {
  const isConnected = useAtomValue(isConnectedAtom)
  const address = useAtomValue(addressAtom)
  const balanceOfUSDC = useAtomValue(balanceOfAtom(TonContractNames.USDC))
  const tonBalance = useAtomValue(balanceOfAtom(TonContractNames.NATIVE))
  const estGas = useAtomValue(routerGasEstimationAtom)
  return (
    <div
      style={{
        padding: '20px',
      }}
    >
      <p>Connected: {isConnected ? 'connected' : 'disconnected'}</p>
      <p>Address: {address || '-'}</p>
      <p>Ton Balance: {`${tonBalance}` || '-'}</p>
      <p>USDC Balance: {`${balanceOfUSDC}` || '-'}</p>
      <p>Est. Gas: {`${estGas}`}</p>
    </div>
  )
}
