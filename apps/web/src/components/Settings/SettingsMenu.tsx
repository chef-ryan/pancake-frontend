import React from 'react'
import { FlexGap } from '@pancakeswap/uikit'

import { SlippageTabs } from './SlippageTabs'
import { DefaultExplorerSettingField } from './DefaultExplorerSettingField'
import { RPCConnectionSettingField } from './RPCConnectionSettingField'

export const SettingsMenu: React.FC = () => {
  return (
    <FlexGap flexDirection="column" gap="24px">
      <SlippageTabs />
      <DefaultExplorerSettingField />
      <RPCConnectionSettingField />
    </FlexGap>
  )
}
