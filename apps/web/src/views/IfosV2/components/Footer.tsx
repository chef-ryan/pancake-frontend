import { BscScanIcon, CardBody, FlexGap, LanguageIcon, Link, Text } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import { useCurrentIfoConfig } from '../hooks/useCurrentIfoConfig'
import { useIFOContract } from '../hooks/ifo/useIFOContract'

export const Footer: React.FC = () => {
  const { theme } = useTheme()
  const ifoContract = useIFOContract()
  const currentIfoConfig = useCurrentIfoConfig()
  return (
    <CardBody>
      <FlexGap gap="12px" flexDirection="column">
        <FlexGap gap="12px">
          <Link href={currentIfoConfig?.projectUrl} target="_blank" rel="noopener noreferrer">
            <LanguageIcon width="24px" color={theme.colors.textSubtle} />
          </Link>
          <Link href={`https://bscscan.com/address/${ifoContract?.address}`} target="_blank" rel="noopener noreferrer">
            <BscScanIcon width="24px" color={theme.colors.textSubtle} />
          </Link>
        </FlexGap>
        <Text color="textSubtle" fontSize="14px" lineHeight="16.8px">
          {currentIfoConfig?.description}
        </Text>
      </FlexGap>
    </CardBody>
  )
}
