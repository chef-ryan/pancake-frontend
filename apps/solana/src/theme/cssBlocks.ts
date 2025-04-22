/**
 * for faster development, just pass css blocks to chakra-ui component
 */

import { SystemProps } from '@chakra-ui/react'
import { colors, sizes } from './cssVariables'

export const heroGridientColorCSSBlock: SystemProps = {
  color: colors.textSecondary,
  fontSize: sizes.textHeroTitle,
  fontWeight: '400'
}

export const panelCard: SystemProps = {
  bg: colors.backgroundLight,
  border: colors.panelCardBorder,
  boxShadow: colors.panelCardShadow,
  borderRadius: ['12px', '20px'],
  overflow: 'hidden'
}
