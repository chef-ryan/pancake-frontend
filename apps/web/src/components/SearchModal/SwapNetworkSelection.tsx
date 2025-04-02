import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { AutoColumn, AutoRow, Flex, InlineMenu, Text } from '@pancakeswap/uikit'
import { ChainLogo } from '@pancakeswap/widgets-internal'
import { useActiveChainId } from 'hooks/useActiveChainId'
import drop from 'lodash/drop'
import take from 'lodash/take'
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

  const [shownChains, hiddenChains] = useMemo(() => {
    const filteredChains = evmChains.filter((chain) => {
      if (chain.id === usedChainId) return false
      if ('testnet' in chain && chain.testnet && chain.id !== ChainId.MONAD_TESTNET) {
        return showTestnet
      }
      return true
    })

    return [take(filteredChains, 4), drop(filteredChains, 4)]
  }, [usedChainId, showTestnet])

  return (
    <AutoColumn gap="sm">
      <AutoRow>
        <Text color="textSubtle" fontSize="14px">
          {t('Network')}
        </Text>
      </AutoRow>
      <RowWrapper>
        {selectedChain ? (
          <ButtonWrapper style={{ marginRight: '4px' }}>
            <BaseWrapper disable>
              <ChainLogo chainId={selectedChain.id} position="relative" top="2px" pl="4px" />
              <Text color="inherit" px="6px">
                {chainNameConverter(selectedChain.name)}
              </Text>
            </BaseWrapper>
          </ButtonWrapper>
        ) : null}

        {shownChains.map((chain) => {
          return (
            <ButtonWrapper key={`buttonNetworkSelect#${chain.id}`} style={{ marginRight: '4px' }}>
              <BaseWrapper onClick={() => onSelect(chain.id)}>
                <ChainLogo chainId={chain.id} px="4px" />
              </BaseWrapper>
            </ButtonWrapper>
          )
        })}

        <InlineMenu
          component={
            <ButtonWrapper>
              <BaseWrapper>
                <Text color="textSubtle" bold px="6px">
                  +{hiddenChains.length}
                </Text>
              </BaseWrapper>
            </ButtonWrapper>
          }
        >
          <Flex flexDirection="column" pt="12px" pb="4px">
            {hiddenChains.map((chain) => {
              return (
                <Flex key={`buttonNetworkSelect#${chain.id}`} onClick={() => onSelect(chain.id)} pb="8px" px="16px">
                  <ChainLogo chainId={chain.id} px="4px" />
                  <Text color="inherit" px="6px">
                    {chainNameConverter(chain.name)}
                  </Text>
                </Flex>
              )
            })}
          </Flex>
        </InlineMenu>
      </RowWrapper>
    </AutoColumn>
  )
}
