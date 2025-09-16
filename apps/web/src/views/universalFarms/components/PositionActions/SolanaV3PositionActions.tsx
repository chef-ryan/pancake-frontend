import styled from 'styled-components'
import { AddIcon, Button, Flex, IconButton, MinusIcon, useModalV2 } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { useCallback, useState } from 'react'
import { useHarvestRewardCallback } from 'hooks/solana/useHarvestRewardCallback'
import SolanaV3RemovePositionModal from '../Modals/solana/SolanaV3RemovePositionModal'
import { StopPropagation } from '../StopPropagation'
import { SolanaV3AddPositionModal } from '../Modals/solana/SolanaV3AddPositionModal'

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
  const addPositionModal = useModalV2()
  const handleRemovePositionClick = useCallback(() => {
    removePositionModal.onOpen()
  }, [removePositionModal])
  const harvestReward = useHarvestRewardCallback()
  const [sending, setSending] = useState(false)
  const handleHarvest = useCallback(async () => {
    if (!poolInfo) return
    setSending(true)
    await harvestReward({
      params: { poolInfo: poolInfo.rawPool, position },
      onSent: () => setSending(false),
      onFinally: () => setSending(false),
    })
  }, [harvestReward, poolInfo, position])

  return (
    <StopPropagation>
      <ActionPanelContainer>
        {!removed && poolInfo?.rawPool && position ? (
          <>
            <IconButton variant="secondary" onClick={handleRemovePositionClick}>
              <MinusIcon color="primary" width="24px" />
            </IconButton>
            {removePositionModal.isOpen && (
              <SolanaV3RemovePositionModal
                isOpen={removePositionModal.isOpen}
                onClose={removePositionModal.onDismiss}
                pool={poolInfo}
                position={position}
              />
            )}
          </>
        ) : null}
        <>
          <IconButton variant="secondary" onClick={addPositionModal.onOpen}>
            <AddIcon color="primary" width="24px" />
          </IconButton>
          {poolInfo && (
            <SolanaV3AddPositionModal
              isOpen={addPositionModal.isOpen}
              onClose={addPositionModal.onDismiss}
              pool={poolInfo}
              position={position}
            />
          )}
        </>
        <Button variant="primary" isLoading={sending} onClick={handleHarvest}>
          {t('Harvest')}
        </Button>
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
