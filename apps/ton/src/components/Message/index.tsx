import { useTranslation } from '@pancakeswap/localization'
import { Box, BoxProps, Button, ChevronDownIcon, FlexGap, LightBulbIcon, Text } from '@pancakeswap/uikit'
import { PropsWithChildren, useState } from 'react'
import styled from 'styled-components'

const SuccessMessage = styled(FlexGap).attrs({ gap: '8px' })`
  align-items: start;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.radii['20px']};
  border: 1px solid ${({ theme }) => theme.colors.primary20};
  background-color: ${({ theme }) => theme.colors.primary10};
`

interface MessageProps extends BoxProps, PropsWithChildren {
  expandedText?: React.ReactNode
}

export const Message = ({ children, expandedText, ...props }: MessageProps) => {
  const { t } = useTranslation()

  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <SuccessMessage {...props}>
      <Box>
        <LightBulbIcon width={24} height={24} color="primary60" />
      </Box>
      <Box>
        {children}
        <br />
        {Boolean(expandedText) && !isExpanded && (
          <Button
            variant="text"
            scale="sm"
            p={0}
            endIcon={<ChevronDownIcon color="primary60" />}
            onClick={() => setIsExpanded(true)}
          >
            <Text color="primary60" small bold mr="-6px">
              {t('Details')}
            </Text>
          </Button>
        )}
        {isExpanded && <Box>{expandedText}</Box>}
      </Box>
    </SuccessMessage>
  )
}
