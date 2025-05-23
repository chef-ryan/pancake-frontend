import { useTranslation } from '@pancakeswap/localization'
import { Box, CopyButton, Flex, FlexProps, Image, Text } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

interface CopyAddressProps extends FlexProps {
  account: string | undefined
  tooltipMessage: string
}

const Wrapper = styled(Flex)`
  align-items: center;
  justify-content: flex-start;
  border-radius: 16px;
  position: relative;
  padding: 8px 16px;
`

const WalletIcon = styled(Box)`
  width: 32px;
  height: 32px;
  margin-right: 12px;
  flex-shrink: 0;
`

const AddressBox = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
`

const WalletAddress = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CopyButtonWrapper = styled(Box)`
  margin-left: 8px;
`

export const CopyAddress: React.FC<React.PropsWithChildren<CopyAddressProps>> = ({
  account,
  tooltipMessage,
  ...props
}) => {
  const { t } = useTranslation()

  // Format the address to show only the first 6 and last 4 characters
  const formatAddress = (address: string | undefined) => {
    if (!address) return ''
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <Box position="relative" {...props}>
      <Wrapper>
        <WalletIcon>
          <Image src="/images/wallets/metamask.png" width={40} height={40} alt="Wallet" />
        </WalletIcon>
        <AddressBox>
          <WalletAddress title={account}>{formatAddress(account)}</WalletAddress>
        </AddressBox>
        <CopyButtonWrapper>
          <CopyButton width="16px" text={account ?? ''} tooltipMessage={tooltipMessage} />
        </CopyButtonWrapper>
      </Wrapper>
    </Box>
  )
}
