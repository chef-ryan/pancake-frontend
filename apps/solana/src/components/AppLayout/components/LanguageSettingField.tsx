import { Select } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { changeLang } from '../../../i18n'
import { SettingField } from './SettingField'

const langOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: '繁體中文', value: 'zh-TW' },
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'jp' },
  { label: 'Korean', value: 'ko' },
  { label: 'Español', value: 'es' },
  { label: 'Français', value: 'fr' },
  { label: 'Русский', value: 'ru' },
  { label: 'Português', value: 'pt' },
  { label: 'Türkçe', value: 'tr' }
]

export function LanguageSettingField() {
  const { i18n, t } = useTranslation()
  const onChange = (v: string) => changeLang(v ?? 'zh-CN' /* Temp */)

  return (
    <SettingField
      fieldName={t('setting_board.language')}
      tooltip={t('setting_board.language_tooltip')}
      renderToggleButton={
        <Select
          defaultOptionIndex={langOptions.findIndex((v) => v.value === i18n.language) + 1}
          options={langOptions}
          onOptionChange={(option) => {
            onChange(option.value ?? 'zh-CN')
          }}
          listStyle={{ maxHeight: '200px', overflowY: 'auto' }}
          // renderTriggerItem={(v) => <Text fontSize="sm">{v && getLangName(v)}</Text>}
        />
      }
    />
  )
}
