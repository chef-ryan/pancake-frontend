import { type BoxProps, AddIcon, Box, CircleLoader } from '@pancakeswap/uikit'

export const AddCircleLoading = ({ width = '30px', ...props }: { width?: string } & BoxProps) => {
  return (
    <Box position="relative" {...props}>
      <Box position="absolute" opacity="0.8" style={{ scale: '1.25' }}>
        <CircleLoader size={width} />
      </Box>

      <AddIcon width={width} />
    </Box>
  )
}
