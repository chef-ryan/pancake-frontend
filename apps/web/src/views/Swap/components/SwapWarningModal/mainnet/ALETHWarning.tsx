import { Link, Text, Box } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'

const ALETHWarning = () => {
  const { t } = useTranslation()

  return (
    <Box maxWidth="380px">
      <Text as="span">
        {t(
          'Please exercise due caution when trading / providing liquidity for the alETH token. The protocol was recently affected by the',
        )}
      </Text>
      <Link
        external
        m="0 4px"
        style={{ display: 'inline' }}
        href="https://x.com/CurveFinance/status/1685925429041917952"
      >
        {t('Curve exploit.')}
      </Link>
      <Text as="span">{t('For more information, please refer to Alchemix’s')}</Text>
      <Link external m="0 4px" style={{ display: 'inline' }} href="https://x.com/AlchemixFi/status/1685737632133971968">
        X
      </Link>
      <Text as="span">{t('and await further updates from the team')}</Text>
    </Box>
  )
}

export default ALETHWarning
