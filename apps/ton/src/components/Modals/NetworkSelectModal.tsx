import { CheckmarkCircleFillIcon, Flex, FlexGap, Text } from '@pancakeswap/uikit'
import { resetAppModalAtom } from 'atoms/modals/appModalAtom'
import { AVAILABLE_NETWORKS } from 'config/constants/networks'
import { useAtomValue, useSetAtom } from 'jotai'
import Link from 'next/link'
import styled from 'styled-components'
import { chainIdAtom } from 'ton/atom/chainIdAtom'

const NetworkRow = styled(Flex)`
  justify-content: space-between;
  padding: 16px;
  border-radius: 8px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.input};
  }
`

export const NetworkSelectModal = () => {
  const currentChainId = useAtomValue(chainIdAtom)
  const resetAppModal = useSetAtom(resetAppModalAtom)

  return (
    <FlexGap gap="8px" flexDirection="column">
      {AVAILABLE_NETWORKS.map((network) => (
        <Link
          href={network.url}
          onClick={() => {
            if (!network.isExternal) resetAppModal()
          }}
        >
          <NetworkRow>
            <FlexGap gap="8px">
              <img src={network.logoURL} alt={network.name} width="24px" />
              <Text bold>{network.symbol}</Text>
            </FlexGap>
            {network.chainId === currentChainId ? <CheckmarkCircleFillIcon color="textSubtle" /> : null}
          </NetworkRow>
        </Link>
      ))}
    </FlexGap>
  )
}
