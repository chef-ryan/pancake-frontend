import { useColorMode } from '@chakra-ui/react'

import { useTranslation } from 'react-i18next'
import Tabs from '@/components/Tabs'
import MoonIcon from '@/icons/misc/MoonIcon'
import SunIcon from '@/icons/misc/SunIcon'

import { SettingField } from './SettingField'
import { colors } from '@/theme/cssVariables'

export function ColorThemeSettingField() {
  const { t } = useTranslation()
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <SettingField
      fieldName={t('setting_board.color_theme')}
      renderToggleButton={
        <Tabs
          variant="roundedSwitch"
          value={colorMode}
          onChange={toggleColorMode}
          items={[
            { value: 'dark', label: (isActive) => <MoonIcon color={isActive ? colors.textRevertPrimary : colors.textSecondary} /> },
            { value: 'light', label: (isActive) => <SunIcon color={isActive ? colors.textRevertPrimary : colors.textSecondary} /> }
          ]}
          size="md"
        />
      }
    />
  )
}
