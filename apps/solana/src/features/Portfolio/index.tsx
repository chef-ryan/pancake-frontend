import { Box } from '@chakra-ui/react'
import { PositionTabValues } from '@/hooks/portfolio/useAllPositionInfo'
import SectionMyCreatedFarms, { CreateFarmTabValues } from './components/SectionMyFarms'
import SectionMyPositions from './components/SectionMyPositions'
import SectionAcceleraytor from './components/SectionIdo'
import { AcceleraytorAlertChip } from './AcceleraytorAlertChip'

export type PortfolioPageQuery = {
  section?: 'overview' | 'my-positions' | 'my-created-farm' | 'acceleraytor'
  position_tab?: PositionTabValues
  create_farm_tab?: CreateFarmTabValues
}

export default function Portfolio() {
  return (
    <Box overflowX="hidden">
      <AcceleraytorAlertChip />
      <SectionMyPositions />
      <SectionMyCreatedFarms />
      <SectionAcceleraytor />
      <Box pb="40px" />
    </Box>
  )
}
