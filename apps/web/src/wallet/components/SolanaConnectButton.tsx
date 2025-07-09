import { Button, ButtonProps, FlexGap, WalletFilledV2Icon } from '@pancakeswap/uikit'
import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import Trans from 'components/Trans'
import { solanaWalletModalAtom } from '../atoms/solanaWalletAtoms'

interface SolanaConnectButtonProps extends ButtonProps {
  withIcon?: boolean
}

const SolanaConnectButton = ({ children, withIcon, ...props }: SolanaConnectButtonProps) => {
  const setOpen = useSetAtom(solanaWalletModalAtom)
  const handleClick = useCallback(() => setOpen(true), [setOpen])

  return (
    <Button onClick={handleClick} {...props}>
      <FlexGap gap="8px" justifyContent="center" alignItems="center">
        {children || <Trans>Connect Wallet</Trans>} {withIcon && <WalletFilledV2Icon color="invertedContrast" />}
      </FlexGap>
    </Button>
  )
}

export default SolanaConnectButton
