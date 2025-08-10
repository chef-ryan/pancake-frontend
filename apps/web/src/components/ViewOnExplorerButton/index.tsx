import { useTranslation } from '@pancakeswap/localization'
import { Box, BoxProps, BscScanIcon, LinkExternal, TooltipOptions, useTooltip } from '@pancakeswap/uikit'
import { useAtom } from 'jotai'
import { solanaExplorerAtom } from '@pancakeswap/utils/user'
import { NonEVMChainId } from '@pancakeswap/chains'
import { getBlockExploreLink } from '../../utils'

interface ViewOnExplorerButtonProps extends BoxProps {
  address: string
  chainId?: number
  type?: 'transaction' | 'token' | 'address' | 'block' | 'countdown'
  color?: string
  width?: string
  tooltipPlacement?: TooltipOptions['placement']
}
export const ViewOnExplorerButton = ({
  address,
  chainId,
  color,
  width,
  type = 'address',
  tooltipPlacement = 'auto',
  ...props
}: ViewOnExplorerButtonProps) => {
  const { t } = useTranslation()
  const [currentExplorer] = useAtom(solanaExplorerAtom)

  const { targetRef, tooltipVisible, tooltip } = useTooltip(t('Open on Explorer'), {
    placement: tooltipPlacement,
  })

  return (
    <>
      <Box ref={targetRef} {...props}>
        <LinkExternal
          href={
            chainId === NonEVMChainId.SOLANA
              ? `${currentExplorer.host}/token/${address}`
              : getBlockExploreLink(address, type, chainId)
          }
          target="_blank"
          rel="noopener noreferrer"
          title={t('Open on Explorer')}
          showExternalIcon={false}
        >
          <BscScanIcon color={color} width={width} />
        </LinkExternal>
      </Box>
      {tooltipVisible && tooltip}
    </>
  )
}
