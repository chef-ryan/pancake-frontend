import { useColorMode } from '@chakra-ui/react'

import { useTranslation } from 'react-i18next'

import { ThemeSwitcher } from '@pancakeswap/uikit'
import { useTheme } from '@pancakeswap/hooks'
import { SettingField } from './SettingField'

export function ColorThemeSettingField() {
  const { t } = useTranslation()
  const { colorMode, toggleColorMode } = useColorMode()
  const { setTheme, theme } = useTheme()

  const handleToggleTheme = () => {
    setTheme(colorMode === 'dark' ? 'light' : 'dark')
    toggleColorMode()
  }

  return (
    <SettingField
      fieldName={t('setting_board.color_theme')}
      renderToggleButton={<ThemeSwitcher isDark={colorMode === 'dark'} toggleTheme={handleToggleTheme} />}
    />
  )
}
