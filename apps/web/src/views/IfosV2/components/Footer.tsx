import { CardBody, FlexGap, Text } from '@pancakeswap/uikit'
import useIfo from '../hooks/useIfo'
import FooterIcons from './FooterIcons'

export const Footer: React.FC = () => {
  const { config: currentIfoConfig } = useIfo()
  return (
    <CardBody>
      <FlexGap gap="12px" width="100%" flexDirection={['column', 'row']} alignItems="center">
        <Text style={{ flex: 1 }} color="textSubtle" fontSize="14px" lineHeight="16.8px" textAlign={['center', 'left']}>
          {currentIfoConfig?.description}
        </Text>
        <FooterIcons />
      </FlexGap>
    </CardBody>
  )
}
