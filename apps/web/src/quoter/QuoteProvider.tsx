import { Suspense } from 'react'
import { QuoteContextProvider } from './hook/QuoteContext'
import { useQuoterSync } from './hook/useQuoterSync'

export const QuoteProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QuoteContextProvider>
      <Suspense
        fallback={
          <div
            style={{
              minHeight: '100vh',
            }}
          />
        }
      >
        {children}
      </Suspense>
      <Suspense fallback={null}>
        <QuoteSync />
      </Suspense>
    </QuoteContextProvider>
  )
}

const QuoteSync = () => {
  useQuoterSync()
  return null
}
