import { LanguageProvider } from '@pancakeswap/localization'
import { dark, light, ModalProvider, ResetCSS, UIKitProvider } from '@pancakeswap/uikit'
import { HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useThemeCookie from 'hooks/useThemeCookie'
import { queryClientAtom } from 'jotai-tanstack-query'
import { Provider as JotaiProvider } from 'jotai/react'
import { useHydrateAtoms } from 'jotai/react/utils'
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from 'next-themes'
import { PropsWithChildren } from 'react'
import GlobalStyle from 'styles/GlobalStyle'
import { TonContextProvider } from 'ton/react/TonContextProvider'
import { AppModal } from './AppModal'

const queryClient = new QueryClient()

function GlobalHooks() {
  useThemeCookie()

  return null
}

const StyledUIKitProvider: React.FC<React.PropsWithChildren> = ({ children, ...props }) => {
  const { resolvedTheme } = useNextTheme()

  return (
    <UIKitProvider theme={resolvedTheme === 'dark' ? dark : light} {...props}>
      {children}
    </UIKitProvider>
  )
}

const HydrateAtoms: React.FC<PropsWithChildren> = ({ children }) => {
  // @ts-ignore
  useHydrateAtoms([[queryClientAtom, queryClient]])
  return children
}

interface ProvidersProps extends PropsWithChildren {
  dehydratedState?: any
}
export const Providers = ({ children, dehydratedState }: ProvidersProps) => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>
          <JotaiProvider>
            <HydrateAtoms>
              <TonContextProvider>
                <NextThemeProvider>
                  <StyledUIKitProvider>
                    <GlobalHooks />
                    <ResetCSS />
                    <GlobalStyle />
                    <LanguageProvider>
                      <ModalProvider>
                        {children}
                        <AppModal />
                      </ModalProvider>
                    </LanguageProvider>
                  </StyledUIKitProvider>
                </NextThemeProvider>
              </TonContextProvider>
            </HydrateAtoms>
          </JotaiProvider>
        </HydrationBoundary>
      </QueryClientProvider>
    </>
  )
}
