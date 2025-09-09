import styled from 'styled-components'
import { AddIcon, Button, Flex, IconButton, MinusIcon, useModalV2 } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { useCallback } from 'react'
import SolanaV3RemovePositionModal from '../Modals/SolanaV3RemovePositionModal'
import { StopPropagation } from '../StopPropagation'

type ActionPanelProps = {
  removed: boolean
  outOfRange: boolean
  chainId: number
  detailMode?: boolean
  poolInfo: SolanaV3PoolInfo | undefined
  position: SolanaV3PositionDetail
}

export const SolanaV3PositionActions: React.FC<ActionPanelProps> = ({ removed, poolInfo, position }) => {
  const { t } = useTranslation()

  const removePositionModal = useModalV2()
  const handleRemovePositionClick = useCallback(() => {
    removePositionModal.onOpen()
  }, [removePositionModal])

  return (
    <StopPropagation>
      <ActionPanelContainer>
        {!removed && poolInfo?.rawPool ? (
          <>
            <IconButton variant="secondary" onClick={handleRemovePositionClick}>
              <MinusIcon color="primary" width="24px" />
            </IconButton>
            <SolanaV3RemovePositionModal
              isOpen={removePositionModal.isOpen}
              onClose={removePositionModal.onDismiss}
              pool={poolInfo}
              position={position}
            />
          </>
        ) : null}
        <IconButton variant="secondary">
          <AddIcon color="primary" width="24px" />
        </IconButton>
        <Button variant="primary">{t('Harvest')}</Button>
      </ActionPanelContainer>
    </StopPropagation>
  )
}

const ActionPanelContainer = styled(Flex)`
  flex-direction: row;
  gap: 8px;
  height: 48px;

  & button {
    flex: 1;
  }
`
