import { useTranslation } from '@pancakeswap/localization'
import { Box, Link, Text } from '@pancakeswap/uikit'

const LUSDWarning = () => {
  const { t } = useTranslation()

  return (
    <Box maxWidth="380px">
      <Text>{t('Caution - %token% Token', { token: 'uniBTC' })}</Text>
      <Text>
        {t(
          'Please exercise due caution when trading / providing liquidity for the uniBTC token. The protocol recently encountered a security compromise.',
        )}

        {t('For more information, please refer to %org%’s', { org: 'BedRock' })}
        <Link external ml="4px" style={{ display: 'inline' }} href="https://x.com/Bedrock_DeFi">
          {X}
        </Link>
      </Text>
    </Box>
  )
}

export default LUSDWarning
