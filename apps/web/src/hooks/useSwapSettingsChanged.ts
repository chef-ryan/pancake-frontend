import { useAudioPlay, useExpertMode, useUserSlippage } from '@pancakeswap/utils/user'
import { useCallback } from 'react'
import { useGasPriceManager } from 'state/user/hooks'
import { useUserTransactionTTL } from 'hooks/useTransactionDeadline'
import { useRoutingSettingChanged } from 'state/user/smartRouter'

export function useSwapSettingsChanged() {
  const [gasPrice, setGasPrice, defaultGasPrice] = useGasPriceManager()
  const [userSlippage, setUserSlippage, defaultUserSlippage] = useUserSlippage()
  const [userTTL, setUserTTL, defaultUserTTL] = useUserTransactionTTL()
  const [audioPlay, setAudioPlay, defaultAudioPlay] = useAudioPlay()
  const [expertMode, setExpertMode, defaultExpertMode] = useExpertMode()
  const [isRoutingSettingChange, reset] = useRoutingSettingChanged()

  const resetSettings = useCallback(() => {
    setUserSlippage(defaultUserSlippage)
    setUserTTL(defaultUserTTL)
    setAudioPlay(defaultAudioPlay)
    setExpertMode(defaultExpertMode)
    setGasPrice(defaultGasPrice)
    reset()
  }, [
    setGasPrice,
    setExpertMode,
    setAudioPlay,
    setUserTTL,
    setUserSlippage,
    defaultGasPrice,
    defaultExpertMode,
    defaultAudioPlay,
    defaultUserTTL,
    defaultUserSlippage,
    reset,
  ])

  return {
    isSwapSettingsChanged:
      isRoutingSettingChange ||
      userSlippage !== defaultUserSlippage ||
      userTTL !== defaultUserTTL ||
      audioPlay !== defaultAudioPlay ||
      expertMode !== defaultExpertMode ||
      gasPrice !== defaultGasPrice,
    resetSettings,
  }
}
