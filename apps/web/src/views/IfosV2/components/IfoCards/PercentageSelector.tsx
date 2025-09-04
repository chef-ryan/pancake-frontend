import { useTranslation } from '@pancakeswap/localization'
import { Button, FlexGap } from '@pancakeswap/uikit'
import type { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'

interface PercentageSelectorProps {
  maxAmountInput?: CurrencyAmount<Currency>
  value: string
  onPercent: (percent: number) => void
  getPercentAmount: (percent: number) => CurrencyAmount<Currency>
}

const PercentageSelector: React.FC<PercentageSelectorProps> = ({
  maxAmountInput,
  value,
  onPercent,
  getPercentAmount,
}) => {
  const { t } = useTranslation()

  if (!maxAmountInput?.greaterThan(0)) return null

  return (
    <FlexGap>
      {[25, 50, 75, 100].map((percent) => {
        const isAtCurrentPercent = maxAmountInput && value !== '0' && value === getPercentAmount(percent).toExact()
        return (
          <Button
            key={`btn_quickCurrency${percent}`}
            data-dd-action-name={`Balance percent ${percent}`}
            onClick={() => onPercent(percent)}
            scale="sm"
            mr="5px"
            width="100%"
            variant={isAtCurrentPercent ? 'primary' : 'secondary'}
            style={{ textTransform: 'uppercase' }}
          >
            {percent === 100 ? t('Max') : `${percent}%`}
          </Button>
        )
      })}
    </FlexGap>
  )
}

export default PercentageSelector
