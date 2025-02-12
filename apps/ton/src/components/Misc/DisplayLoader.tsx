import { BoxProps, Loading } from '@pancakeswap/uikit'
import { PropsWithChildren } from 'react'

interface DisplayLoaderProps extends BoxProps, PropsWithChildren {
  loading: boolean
}

export const DisplayLoader = ({ loading, children, ...props }: DisplayLoaderProps) => {
  if (loading) return <Loading {...props} />
  return children
}
