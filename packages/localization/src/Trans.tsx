/* eslint-disable no-cond-assign */
import { Children, createElement, Fragment, isValidElement, ReactNode } from 'react'
import { ContextData, TranslationKey } from './types'
import useTranslation from './useTranslation'

const placeholderRegex = /<\/?(\d+)>/g

const interpolateComponents = (text: string, components: ReactNode[]) => {
  const parts: ReactNode[] = []
  const stack: { index: number; children: ReactNode[] }[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = placeholderRegex.exec(text)) !== null) {
    const [token, indexStr] = match
    const index = parseInt(indexStr, 10)
    const preceding = text.slice(lastIndex, match.index)
    if (preceding) {
      const target = stack.length ? stack[stack.length - 1].children : parts
      target.push(preceding)
    }
    if (token.startsWith('</')) {
      const node = stack.pop()
      if (node && node.index === index) {
        const element = isValidElement(components[index])
          ? createElement(components[index] as any, (components[index] as any).props, ...node.children)
          : null
        if (element !== null) {
          const target = stack.length ? stack[stack.length - 1].children : parts
          target.push(element)
        }
      }
    } else {
      stack.push({ index, children: [] })
    }
    lastIndex = match.index + token.length
  }

  const rest = text.slice(lastIndex)
  if (rest) {
    const target = stack.length ? stack[stack.length - 1].children : parts
    target.push(rest)
  }

  return parts
}

const extractComponents = (nodes: ReactNode): { components: ReactNode[]; text: string } => {
  const components: ReactNode[] = []

  const traverse = (child: ReactNode): string => {
    if (typeof child === 'string') {
      return child
    }
    if (typeof child === 'number') {
      return String(child)
    }
    if (isValidElement(child)) {
      const index = components.length
      const inner = traverse(child.props.children)
      // eslint-disable-next-line react/no-children-prop
      components.push(createElement(child.type, { ...child.props, children: undefined }))
      return `<${index}>${inner}</${index}>`
    }
    let result = ''
    Children.forEach(child as any, (c) => {
      result += traverse(c)
    })
    return result
  }

  return { components, text: traverse(nodes) }
}

export interface TransProps {
  i18nKey?: TranslationKey
  components?: ReactNode[]
  children?: ReactNode
  values?: ContextData
  [key: string]: string | number | ReactNode | ContextData | undefined
}

export const Trans = <T extends Record<string, string | number>>(props: TransProps & T) => {
  const { i18nKey, components, children, values = {}, ...restValues } = props
  const { t } = useTranslation()

  let key = i18nKey
  let comp = components

  if (!key && typeof children === 'string') {
    key = children
  } else if (children) {
    const extracted = extractComponents(children)
    comp = comp || extracted.components
    key = key || extracted.text
  }

  if (!key) {
    return null
  }

  const translated = t(key, { ...values, ...restValues })

  if (!comp || comp.length === 0) {
    return createElement(Fragment, {}, translated)
  }

  const nodes = interpolateComponents(translated, comp)
  return createElement(Fragment, {}, ...nodes)
}
