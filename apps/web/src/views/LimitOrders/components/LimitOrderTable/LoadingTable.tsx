import { Skeleton, Table, Td } from '@pancakeswap/uikit'
import { memo } from 'react'
import styled from 'styled-components'

const LoadingTable = ({ lines, className }: { lines?: number; className?: string }) => (
  <Table className={className}>
    <tbody>
      {Array.from({ length: lines || 3 }).map((_, index) => (
        <tr key={index}>
          <Td>
            <StyledSkeleton />
          </Td>
          <Td>
            <StyledSkeleton />
          </Td>
          <Td>
            <StyledSkeleton />
          </Td>
        </tr>
      ))}
    </tbody>
  </Table>
)

const StyledSkeleton = styled(Skeleton)`
  background: ${({ theme }) => theme.colors.bubblegum};
  opacity: 1;
`

export default memo(LoadingTable)
