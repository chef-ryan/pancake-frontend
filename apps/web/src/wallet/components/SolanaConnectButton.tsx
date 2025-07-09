import { Button, ButtonProps, FlexGap, WalletFilledV2Icon } from '@pancakeswap/uikit'
import { useSetAtom, useAtomValue } from 'jotai'
import { useCallback } from 'react'
import Trans from 'components/Trans'
import { solanaWalletModalAtom, solanaWalletStateAtom } from '../atoms/solanaWalletAtoms'

interface SolanaConnectButtonProps extends ButtonProps {
  withIcon?: boolean
}

const shortenAddress = (address: string, chars = 4) => `${address.slice(0, chars)}...${address.slice(-chars)}`

const SolanaConnectButton = ({ children, withIcon, ...props }: SolanaConnectButtonProps) => {
  const setOpen = useSetAtom(solanaWalletModalAtom)
  const { account, status } = useAtomValue(solanaWalletStateAtom)
  const handleClick = useCallback(() => setOpen(true), [setOpen])

  const content = account ? shortenAddress(account) : children || <Trans>Connect Wallet</Trans>

  return (
    <Button onClick={handleClick} disabled={status === 'connected'} {...props}>
      <FlexGap gap="8px" justifyContent="center" alignItems="center">
        {content} {withIcon && <WalletFilledV2Icon color="invertedContrast" />}
      </FlexGap>
    </Button>
  )
}

export default SolanaConnectButton
