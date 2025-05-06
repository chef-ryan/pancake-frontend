import { useColorMode } from '@chakra-ui/react'

import { useTranslation } from 'react-i18next'

import { ThemeSwitcher } from '@pancakeswap/uikit'
import { SettingField } from './SettingField'

export function ColorThemeSettingField() {
  const { t } = useTranslation()
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <SettingField
      fieldName={t('setting_board.color_theme')}
      renderToggleButton={<ThemeSwitcher isDark={colorMode === 'dark'} toggleTheme={toggleColorMode} />}
    />
  )
}
