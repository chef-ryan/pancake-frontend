import { useColorMode } from '@chakra-ui/react'

import { useTranslation } from 'react-i18next'

import { ThemeSwitcher } from '@pancakeswap/uikit'
import { useTheme } from '@pancakeswap/hooks'
import { SettingField } from './SettingField'

export function ColorThemeSettingField() {
  const { t } = useTranslation()
  const { toggleColorMode } = useColorMode()
  const { setTheme, isDark } = useTheme()

  const handleToggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
    toggleColorMode()
  }

  return (
    <SettingField
      fieldName={t('setting_board.color_theme')}
      renderToggleButton={<ThemeSwitcher isDark={isDark} toggleTheme={handleToggleTheme} />}
    />
  )
}
