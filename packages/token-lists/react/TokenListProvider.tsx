import { useAtomValue, useSetAtom } from 'jotai'
import { createContext, useContext, useEffect } from 'react'
import { initTokenListsAtom, tokenListInitializedAtom } from './atoms/init.atoms'

const TokenListContext = createContext<{
  listName?: string
}>({})
export const TokenListProvider = ({
  children,
  listName,
  listsMap,
}: {
  children: React.ReactNode
  listsMap: Record<string, string[]>
  listName: string
}) => {
  const init = useSetAtom(initTokenListsAtom)
  const initialized = useAtomValue(tokenListInitializedAtom(listName))

  useEffect(() => {
    init(listName, listsMap)
  }, [])

  if (!initialized) return null

  return (
    <TokenListContext.Provider
      value={{
        listName,
      }}
    >
      <>{children}</>
    </TokenListContext.Provider>
  )
}

export const useTokenListName = () => {
  const context = useContext(TokenListContext)
  if (!context) {
    throw new Error('useTokenListName must be used within a TokenListProvider')
  }
  return context.listName!
}
