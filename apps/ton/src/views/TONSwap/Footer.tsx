import { useTranslation } from '@pancakeswap/localization'
import { Flex, LinkExternal } from '@pancakeswap/uikit'
import { bridgeLink } from 'config/constants/endpoints'

export const Footer = () => {
  const { t } = useTranslation()

  return (
    <Flex justifyContent="center">
      <LinkExternal href={bridgeLink} color="primary60">
        {t('Bridge Assets to TON Chain')}
      </LinkExternal>
    </Flex>
  )
}
