import { AddIcon, Box, CircleLoader } from '@pancakeswap/uikit'

export const AddCircleLoading = () => {
  return (
    <>
      <Box position="relative">
        <Box position="absolute" opacity="0.8" style={{ scale: '1.25' }}>
          <CircleLoader size="24px" />
        </Box>

        <AddIcon width="24px" />
      </Box>
    </>
  )
}
