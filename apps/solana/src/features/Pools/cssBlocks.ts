import { SystemStyleObject } from '@chakra-ui/react'

export const poolListGrid: SystemStyleObject = {
  display: 'grid',
  gridTemplateColumns: ['2fr 1fr', 'minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(200px, 1fr)'],
  columnGap: ['max(1rem, 2%)', '3%'],
  alignItems: 'center'
}
