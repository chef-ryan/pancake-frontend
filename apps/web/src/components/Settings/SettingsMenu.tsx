import React from 'react'
import { FlexGap } from '@pancakeswap/uikit'

import { SlippageTabs } from './SlippageTabs'
import { DefaultExplorerSettingField } from './DefaultExplorerSettingField'
import { RPCConnectionSettingField } from './RPCConnectionSettingField'
import { PriorityFeeSettingField } from './PriorityFeeSettingField'

export const SettingsMenu: React.FC = () => {
  return (
    <FlexGap flexDirection="column" gap="24px">
      <SlippageTabs />
      <PriorityFeeSettingField />
      <DefaultExplorerSettingField />
      <RPCConnectionSettingField />
    </FlexGap>
  )
}
