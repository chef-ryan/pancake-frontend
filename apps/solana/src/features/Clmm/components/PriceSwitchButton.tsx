import { SwapHorizIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Button } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'

export default function PriceSwitchButton(props: { priceLabel: string; onClickSwitch: () => void }) {
  const { t } = useTranslation()
  return (
    <Button
      size="sm"
      variant="primary60"
      borderRadius="12px"
      fontWeight={400}
      fontSize="xs"
      px="8px"
      minWidth="auto"
      color={colors.textSubtle}
      onClick={props.onClickSwitch}
    >
      {props.priceLabel} {t('common.price')}{' '}
      <SwapHorizIcon
        color={colors.primary60}
        style={{
          marginLeft: '2px'
        }}
      />
    </Button>
  )
}
