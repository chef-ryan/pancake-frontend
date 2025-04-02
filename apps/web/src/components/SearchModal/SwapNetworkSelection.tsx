import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { AutoColumn, AutoRow, Text } from '@pancakeswap/uikit'
import { ChainLogo } from '@pancakeswap/widgets-internal'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useMemo } from 'react'
import { chainNameConverter } from 'utils/chainNameConverter'
import { chains as evmChains } from 'utils/wagmi'
import { BaseWrapper, ButtonWrapper, RowWrapper } from './CommonBases'

export default function SwapNetworkSelection({
  chainId,
  onSelect,
  showTestnet,
}: {
  showTestnet?: boolean
  chainId?: ChainId
  onSelect: (chainId: ChainId) => void
}) {
  const { chainId: activeChainId } = useActiveChainId()

  const usedChainId = chainId ?? activeChainId

  const { t } = useTranslation()

  const selectedChain = useMemo(() => evmChains.find((chain) => chain.id === usedChainId), [usedChainId])

  return (
    <AutoColumn gap="sm">
      <AutoRow>
        <Text color="textSubtle" fontSize="14px">
          {t('Network')}
        </Text>
      </AutoRow>
      <RowWrapper>
        {selectedChain ? (
          <ButtonWrapper>
            <BaseWrapper disable>
              <ChainLogo chainId={selectedChain.id} position="relative" top="2px" pl="4px" />
              <Text color="inherit" px="6px">
                {chainNameConverter(selectedChain.name)}
              </Text>
            </BaseWrapper>
          </ButtonWrapper>
        ) : null}

        {evmChains
          .filter((chain) => {
            if (chain.id === usedChainId) return false
            if ('testnet' in chain && chain.testnet && chain.id !== ChainId.MONAD_TESTNET) {
              return showTestnet
            }
            return true
          })
          .map((chain) => {
            return (
              <ButtonWrapper key={`buttonNetworkSelect#${chain.id}`}>
                <BaseWrapper onClick={() => onSelect(chain.id)}>
                  <ChainLogo chainId={chain.id} px="4px" />
                </BaseWrapper>
              </ButtonWrapper>
            )
          })}
      </RowWrapper>
    </AutoColumn>
  )
}
