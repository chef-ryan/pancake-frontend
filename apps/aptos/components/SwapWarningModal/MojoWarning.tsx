import { LinkExternal, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'

const MojitoWarning = () => {
  const { t } = useTranslation()

  return (
    <>
      <Text>{t('Please note that the Mojito Markets team have paused project development for the time being')}</Text>
      <LinkExternal href="https://x.com/MojitoMarkets/status/1604940075636527104">
        {t('For more info, please see %brand%’s X.', { brand: 'Mojito Markets' })}
      </LinkExternal>
    </>
  )
}

export default MojitoWarning
