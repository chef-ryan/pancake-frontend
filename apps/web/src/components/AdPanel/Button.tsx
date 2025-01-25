import {
  Button,
  ButtonProps,
  ChevronRightIcon,
  ChevronsCollapseIcon,
  ChevronsExpandIcon,
  Link,
  OpenNewIcon,
} from '@pancakeswap/uikit'
import { PropsWithChildren, useMemo } from 'react'
import styled from 'styled-components'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'

const StyledButton = styled(Button)<{ $variant?: string }>`
  transition: all 0.2s ease-in-out;
  border-radius: ${({ theme }) => theme.radii['12px']};
  ${({ theme, $variant }) =>
    $variant === 'text' &&
    `
    font-size: 14px;
    padding: 0;
    color: ${theme.colors.primary60};
    `};
`

interface AdButtonProps extends ButtonProps, PropsWithChildren {
  isExternalLink?: boolean
  externalIcon?: boolean
  chevronRightIcon?: boolean
  href?: string
}

export const AdButton = ({
  children,
  endIcon,
  isExternalLink,
  externalIcon,
  chevronRightIcon,
  href,
  ...props
}: AdButtonProps) => {
  const useNextLink = useMemo(() => {
    const isInternal = href?.startsWith('/') ?? false
    const hasUTM = href?.includes('utm') ?? false
    return isInternal && !hasUTM
  }, [href])

  const styledButton = (
    <StyledButton
      scale="sm"
      variant="subtle"
      width="max-content"
      padding="7px 8px 9px 8px"
      fontSize="inherit"
      endIcon={
        endIcon ||
        (chevronRightIcon ? (
          <ChevronRightIcon color="invertedContrast" width="24px" style={{ margin: '1px 0 0 0' }} />
        ) : externalIcon ? (
          <OpenNewIcon color={props.variant === 'text' ? 'primary60' : 'invertedContrast'} />
        ) : null)
      }
      $variant={props.variant}
      {...props}
    >
      {children}
    </StyledButton>
  )

  return useNextLink ? (
    <NextLinkFromReactRouter to={href} color="inherit" style={{ textDecoration: 'none' }}>
      {styledButton}
    </NextLinkFromReactRouter>
  ) : (
    <Link href={href} fontSize="inherit" color="inherit" external={isExternalLink} style={{ textDecoration: 'none' }}>
      {styledButton}
    </Link>
  )
}

interface ExpandButtonProps extends AdButtonProps {
  isExpanded?: boolean
}
export const ExpandButton = ({ isExpanded, ...props }: ExpandButtonProps) => {
  return (
    <AdButton
      variant={isExpanded ? 'text' : 'subtle'}
      endIcon={
        isExpanded ? (
          <ChevronsCollapseIcon color="primary60" />
        ) : isExpanded === false ? (
          <ChevronsExpandIcon color="invertedContrast" />
        ) : null
      }
      {...props}
    >
      {isExpanded ? 'Hide' : 'Details'}
    </AdButton>
  )
}
