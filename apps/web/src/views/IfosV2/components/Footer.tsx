import { BscScanIcon, CardBody, FlexGap, LanguageIcon, Link, Text } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import useIfo from '../hooks/useIfo'

export const Footer: React.FC = () => {
  const { theme } = useTheme()
  const { ifoContract, config: currentIfoConfig } = useIfo()
  return (
    <CardBody>
      <FlexGap gap="12px" width="100%" flexDirection={['column', 'row']} alignItems="center">
        <Text flex="1" color="textSubtle" fontSize="14px" lineHeight="16.8px" textAlign={['center', 'left']}>
          {currentIfoConfig?.description}
        </Text>
        <FlexGap gap="12px" justifyContent={['center', 'flex-end']}>
          <Link href={currentIfoConfig?.projectUrl} target="_blank" rel="noopener noreferrer">
            <LanguageIcon width="24px" color={theme.colors.textSubtle} />
          </Link>
          <Link href={`https://bscscan.com/address/${ifoContract?.address}`} target="_blank" rel="noopener noreferrer">
            <BscScanIcon width="24px" color={theme.colors.textSubtle} />
          </Link>
        </FlexGap>
      </FlexGap>
    </CardBody>
  )
}
