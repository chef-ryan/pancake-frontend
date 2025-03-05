import { useTranslation } from '@pancakeswap/localization'
import { ChevronDownIcon } from '@pancakeswap/uikit'
import { setNetworkModalAtom } from 'atoms/modals/networkModalAtom'
import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { TertiaryButton } from 'styles'
import { getAssetUrl } from 'utils'

export const NetworkButton = () => {
  const { t } = useTranslation()
  const setNetworkModal = useSetAtom(setNetworkModalAtom)

  const openNetworkModal = useCallback(() => {
    setNetworkModal()
  }, [setNetworkModal])

  return (
    <>
      <TertiaryButton
        height={34}
        px="0"
        onClick={openNetworkModal}
        startIcon={<img src={getAssetUrl('ton-logo.png')} alt="TON" width={34} />}
      >
        <ChevronDownIcon />
      </TertiaryButton>
    </>
  )
}
