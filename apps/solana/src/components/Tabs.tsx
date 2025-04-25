import { ButtonMenuProps, ButtonMenu, ButtonMenuItem } from '@pancakeswap/uikit'
import { Scale, Variant } from '@pancakeswap/uikit/components/Button/types'
import { SystemStyleObject, TabListProps as CTabListProps, TooltipProps } from '@chakra-ui/react'
import { ReactNode, useCallback, useEffect, useState } from 'react'

import { useEvent } from '@/hooks/useEvent'
import { shrinkToValue } from '@/utils/shrinkToValue'

type TabOptionsObj = {
  value: string
  label?: ReactNode | ((isActive: boolean) => ReactNode)
  defaultChecked?: boolean
  disabled?: boolean
  tooltipProps?: Omit<TooltipProps, 'children'>
}

export type TabItem<T extends string = string> = (TabOptionsObj & { value: T }) | T

type TabsProps<T extends string> = Omit<ButtonMenuProps, 'children'> & {
  size?: Scale
  items: readonly TabItem<T>[]
  variant?: Variant
  tabListSX?: CTabListProps['sx']
  onChange?: (value: T) => void
  value?: T
  defaultValue?: T

  renderItem?(itemValue?: T, idx?: number): ReactNode
  tabItemSX?: SystemStyleObject
}

export default function Tabs<T extends string = string>({
  items: rawOptions,
  size = 'sm',
  variant = 'subtle',
  onChange,
  value,
  defaultValue,
  renderItem,
  ...rest
}: TabsProps<T>) {
  const options = rawOptions.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  const inputValueIndex = value ? options.findIndex((option) => option.value === value && !option.disabled) : undefined
  const defaultInputValueIndex = defaultValue ? options.findIndex((option) => option.value === defaultValue && !option.disabled) : undefined
  const [activeIndex, setActiveIndex] = useState(inputValueIndex ?? defaultInputValueIndex)
  const syncActiveIndexState = (idx: number) => setActiveIndex(idx)
  useEffect(() => {
    if (inputValueIndex != null) {
      syncActiveIndexState(inputValueIndex)
    }
  }, [inputValueIndex])

  const onTabChange = useEvent((idx: number) => {
    if (options[idx].disabled) return
    onChange?.(options[idx].value)
  })

  const handleItemClick = useCallback(
    (idx: number) => {
      syncActiveIndexState(idx)
      onTabChange(idx)
    },
    [onTabChange]
  )

  return (
    <ButtonMenu scale={size} activeIndex={inputValueIndex} onItemClick={handleItemClick} variant={variant} {...rest}>
      {options.map((option, idx) => (
        <ButtonMenuItem key={`${option.value}`}>
          {renderItem?.(option.value, idx) ?? shrinkToValue(option.label, [activeIndex === idx]) ?? option.value}
        </ButtonMenuItem>
      ))}
    </ButtonMenu>
  )
}
