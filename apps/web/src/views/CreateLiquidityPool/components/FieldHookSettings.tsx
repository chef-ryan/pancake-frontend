import { HOOK_CATEGORY, HookData } from '@pancakeswap/infinity-sdk'
import { BoxProps } from '@pancakeswap/uikit'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useDefaultDynamicHook } from 'hooks/infinity/useHooksList'
import { useCallback, useEffect } from 'react'
import { useFeeTierSettingQueryState, usePoolTypeQueryState } from 'state/infinity/create'
import { HookSettings } from 'views/HookSettings/HookSettings'
import { useHookEnabledQueryState, useHookSelectTypeQueryState } from 'views/HookSettings/hooks/useQueriesState'
import { useSelectHookFromList } from 'views/HookSettings/hooks/useSelectHookFromList'

type FieldHookSettingsProps = BoxProps

export const FieldHookSettings: React.FC<FieldHookSettingsProps> = ({ ...boxProps }) => {
  const [feeTierSetting, setFeeTierSetting] = useFeeTierSettingQueryState()
  const [hook, setHook] = useSelectHookFromList()
  const [, setHookEnabled] = useHookEnabledQueryState()
  const [, setHookSelectType] = useHookSelectTypeQueryState()
  const { chainId } = useSelectIdRouteParams()
  const [poolType] = usePoolTypeQueryState()
  const dynamicHook = useDefaultDynamicHook(chainId, poolType)

  // auto update the feeSetting to 'dynamic' or 'static' when hook change
  const handleHookChange = useCallback(
    (hookData?: HookData) => {
      setFeeTierSetting(hookData?.category?.includes(HOOK_CATEGORY.DynamicFees) ? 'dynamic' : 'static')
    },
    [setFeeTierSetting],
  )

  const handleHookEnalbledChange = useCallback(
    (enabled: boolean) => {
      if (!enabled && feeTierSetting === 'dynamic') {
        setFeeTierSetting('static')
      }
    },
    [setFeeTierSetting, feeTierSetting],
  )

  // if dynamic fee, autoselect the dynamicFees hook if there are no any hook selected
  useEffect(() => {
    if (feeTierSetting === 'dynamic') {
      setHook(dynamicHook)
      setHookEnabled(true)
      setHookSelectType('list')
    } else if (feeTierSetting === 'static' && hook === dynamicHook) {
      setHook(undefined)
    }
  }, [dynamicHook, feeTierSetting, hook, setHook, setHookEnabled, setHookSelectType])

  return <HookSettings onHookEnabledChange={handleHookEnalbledChange} onHookChange={handleHookChange} {...boxProps} />
}
