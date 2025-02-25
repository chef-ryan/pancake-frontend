import { TonConnectUIProvider, useTonAddress } from '@tonconnect/ui-react'
import { useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { tonStateAtom } from 'ton/atom/tonStateAtom'

export const TonContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <TonConnectUIProvider
      manifestUrl={`${typeof window !== 'undefined' && window.location.origin}/${
        process.env.NEXT_PUBLIC_GLOBAL_PREFIX || ''
      }/ton-manifest.json`}
    >
      <Container>{children}</Container>
    </TonConnectUIProvider>
  )
}

const Container = ({ children }: { children: React.ReactNode }) => {
  const address = useTonAddress()

  const [init, setInit] = useState(false)
  const setTonState = useSetAtom(tonStateAtom)

  useEffect(() => {
    if (address) {
      setTonState((prev) => {
        return {
          ...prev,
          address,
        }
      })
    } else {
      setTonState((prev) => {
        return { ...prev, address: '' }
      })
    }

    if (!init) {
      setInit(true)
    }
  }, [address, init, setTonState])

  if (!init) {
    return null
  }

  return children
}
