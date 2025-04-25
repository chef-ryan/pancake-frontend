import { ErrorIcon, Message, MessageText } from '@pancakeswap/uikit'
import { Box, BoxProps, Flex, HStack, Text } from '@chakra-ui/react'
import ExclaimationOctagon from '@/icons/misc/ExclaimationOctagon'
import { useAppStore } from '@/store'
import { panelCard } from '@/theme/cssBlocks'
import { colors } from '@/theme/cssVariables'

type SubPageNoteProps = {
  title: React.ReactNode
  description: React.ReactNode
}

/** this board is often for a subPage link create-pool edit-farm , to describe how to use this section */
export default function SubPageNote({ title, description, ...boxProps }: SubPageNoteProps & Omit<BoxProps, keyof SubPageNoteProps>) {
  const isMobile = useAppStore((s) => s.isMobile)

  return (
    <>
      {isMobile ? (
        <Box
          {...panelCard}
          borderRadius="20px"
          px={4}
          py={5}
          mt={2}
          mb={6}
          {...boxProps}
          bg={colors.tooltipBg}
          border={`1px solid ${colors.textTertiary}`}
        >
          <HStack align="flex-start" spacing={3}>
            <Flex flexGrow={1} direction="row">
              <Box pr={2}>
                <ExclaimationOctagon color={colors.textSecondary} />
              </Box>
              <Text color={colors.textSecondary} fontSize="sm">
                {title}
                {description}
              </Text>
            </Flex>
          </HStack>
        </Box>
      ) : (
        <Message variant="warning" icon={<ErrorIcon color={colors.warning50} />} style={{ borderColor: colors.warning20 }}>
          <MessageText>
            <HStack align="flex-start" spacing={3}>
              <Flex flexGrow={1} direction="column">
                <Text color={colors.textPrimary} fontWeight={600} fontSize="md">
                  {title}
                </Text>
                <Text pt={1} as="div" color={colors.textPrimary} fontSize="sm">
                  {description}
                </Text>
              </Flex>
            </HStack>
          </MessageText>
        </Message>
      )}
    </>
  )
}
