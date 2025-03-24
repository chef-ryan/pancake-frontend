import { ChevronDownIcon } from '@pancakeswap/uikit'
import { setNetworkModalAtom } from 'atoms/modals/networkModalAtom'
import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import styled from 'styled-components'
import { TertiaryButton } from 'styles'
import { getAssetUrl } from 'utils'

const StyledTertiaryButton = styled(TertiaryButton)`
  max-width: 56px;
`

export const NetworkButton = () => {
  const setNetworkModal = useSetAtom(setNetworkModalAtom)

  const openNetworkModal = useCallback(() => {
    setNetworkModal()
  }, [setNetworkModal])

  return (
    <>
      <StyledTertiaryButton
        height={34}
        px="0"
        onClick={openNetworkModal}
        startIcon={<img src={getAssetUrl('ton-logo.png')} alt="TON" width={34.5} style={{ marginLeft: '-2px' }} />}
      >
        <ChevronDownIcon />
      </StyledTertiaryButton>
    </>
  )
}
