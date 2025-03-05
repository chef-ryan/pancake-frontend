import { useUserShowTestnet } from 'state/user/hooks/useUserShowTestnet'
import { useUserTokenRisk } from 'state/user/hooks/useUserTokenRisk'
import { useWebNotifications } from 'hooks/useWebNotifications'
import { useAllowNotifications } from 'state/notifications/hooks'
import { useCallback } from 'react'
import { useGasPriceManager, useSubgraphHealthIndicatorManager, useUserUsernameVisibility } from 'state/user/hooks'

export function useGlobalSettingsChanged() {
  const [subgraphHealth, setSubgraphHealth, defaultSubgraphHealthValue] = useSubgraphHealthIndicatorManager()
  const [userUsernameVisibility, setUsernameVisibility, defaultUserUsernameVisibilityValue] =
    useUserUsernameVisibility()
  const [showTestnet, setShowTestnet, defaultShowTestnetValue] = useUserShowTestnet()
  const [tokenRisk, setTokenRisk, defaultTokenRiskValue] = useUserTokenRisk()
  const { enabled: notificationsEnabled, defaultValue: defaultNotificationsValue } = useWebNotifications()
  const [, setAllowNotifications] = useAllowNotifications()
  const [gasPrice, setGasPrice, defaultGasPrice] = useGasPriceManager()

  const resetSettings = useCallback(() => {
    setSubgraphHealth(defaultSubgraphHealthValue)
    setUsernameVisibility(defaultUserUsernameVisibilityValue)
    setShowTestnet(defaultShowTestnetValue)
    setTokenRisk(defaultTokenRiskValue)
    setAllowNotifications(defaultNotificationsValue ?? true)
    setGasPrice(defaultGasPrice)
  }, [
    setShowTestnet,
    setTokenRisk,
    setAllowNotifications,
    setGasPrice,
    setSubgraphHealth,
    setUsernameVisibility,
    defaultNotificationsValue,
    defaultShowTestnetValue,
    defaultSubgraphHealthValue,
    defaultTokenRiskValue,
    defaultUserUsernameVisibilityValue,
    defaultGasPrice,
  ])

  return {
    isGlobalSettingsChanged:
      subgraphHealth !== defaultSubgraphHealthValue ||
      userUsernameVisibility !== defaultUserUsernameVisibilityValue ||
      showTestnet !== defaultShowTestnetValue ||
      tokenRisk !== defaultTokenRiskValue ||
      notificationsEnabled !== defaultNotificationsValue ||
      gasPrice !== defaultGasPrice,
    resetSettings,
  }
}
