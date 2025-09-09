import styled from 'styled-components'
import { AddIcon, Button, Flex, IconButton, MinusIcon } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { StopPropagation } from '../StopPropagation'

type ActionPanelProps = {
  removed: boolean
  outOfRange: boolean
  chainId: number
  detailMode?: boolean
}

export const SolanaV3PositionActions: React.FC<ActionPanelProps> = ({ removed }) => {
  const { t } = useTranslation()
  return (
    <StopPropagation>
      <ActionPanelContainer>
        {!removed ? (
          <IconButton variant="secondary">
            <MinusIcon color="primary" width="24px" />
          </IconButton>
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
