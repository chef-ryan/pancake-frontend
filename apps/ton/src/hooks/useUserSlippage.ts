import { settingsAtom, userSlippagePercentAtom } from 'atoms/settings/settingsAtom'
import { useAtom } from 'jotai'

export const useUserSlippagePercent = () => {
  return useAtom(userSlippagePercentAtom)
}

export const useUserSlippage = () => {
  const [{ slippage }, setSettings] = useAtom(settingsAtom)

  const setSlippage = (newSlippage: number) => {
    setSettings((prev) => ({
      ...prev,
      slippage: newSlippage,
    }))
  }

  return [slippage, setSlippage] as const
}
