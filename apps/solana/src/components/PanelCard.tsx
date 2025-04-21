import React from 'react'
import { Box, BoxProps } from '@chakra-ui/react'
import { panelCard } from '@/theme/cssBlocks'

export interface PanelCardProps extends BoxProps {
  variant?: 'light' | 'dark'
}

const PanelCard = React.forwardRef<HTMLDivElement, PanelCardProps>((props, ref) => {
  return <Box ref={ref} {...panelCard} display="flex" flexDir="column" {...props} />
})

PanelCard.displayName = 'PanelCard'

/** @deprecated just use block:{@link panelCard} */
export default PanelCard
