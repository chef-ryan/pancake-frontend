import { useTranslation } from '@pancakeswap/localization'
import { useTooltip } from '@pancakeswap/uikit'
import { FarmWidget } from '@pancakeswap/widgets-internal'

const { ManualPoolTag } = FarmWidget.Tags

const PoolTypeTag = ({ children }) => {
  const { t } = useTranslation()

  const tooltipText = t('You must harvest and compound your earnings from this pool manually.')

  const { targetRef, tooltip, tooltipVisible } = useTooltip(tooltipText, {
    placement: 'bottom',
  })

  return (
    <>
      <ManualPoolTag />
      {tooltipVisible && tooltip}
      {children(targetRef)}
    </>
  )
}

export default PoolTypeTag
