import { FlexGap, FlexGapProps, Text } from '@pancakeswap/uikit'
import { getAssetUrl } from 'utils'

interface ConnectWalletDisclaimerProps extends FlexGapProps {
  text?: string
  imgWidth?: number
}

export const WalletDisclaimer = ({ text, imgWidth, ...props }: ConnectWalletDisclaimerProps) => {
  return (
    <FlexGap flexDirection="column" alignItems="center" gap="16px" {...props}>
      <img src={getAssetUrl('wallet.png')} alt="wallet" width={imgWidth || 64} />
      <Text color="textSubtle" fontSize={['14px', '14px', '16px']} textAlign="center">
        {text}
      </Text>
    </FlexGap>
  )
}
