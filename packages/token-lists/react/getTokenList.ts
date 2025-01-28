/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import { TokenList, TokenInfo } from '@pancakeswap/token-lists'
import uriToHttp from '@pancakeswap/utils/uriToHttp'
import remove from 'lodash/remove'
import Ajv from 'ajv'
import schema from '../schema/pancakeswap.json'

export const tokenListValidator = new Ajv({ allErrors: true }).compile(schema)

/**
 * Contains the logic for resolving a list URL to a validated token list
 * @param listUrl list url
 */
export default async function getTokenList(listUrl: string): Promise<TokenList> {
  const urls: string[] = uriToHttp(listUrl)

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const isLast = i === urls.length - 1
    let json: any
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Response not ok ${listUrl}`)
      }
      json = await response.json()
    } catch (error) {
      console.error('Failed to fetch list', listUrl, error)
      if (isLast) throw new Error(`Failed to download list ${listUrl}`)
      continue
    }
    if (!tokenListValidator(json)) {
      const invalidIndices = new Set<number>()
      const preFilterValidationErrors: string =
        tokenListValidator.errors?.reduce<string>((memo, error) => {
          const dataPath = (error as any)?.dataPath as string
          const match = dataPath?.match(/\.tokens\[(\d+)\]/)
          if (match) {
            const index = parseInt(match[1], 10)
            invalidIndices.add(index)
          }
          const add = `${(error as any).dataPath} ${error.message ?? ''}`
          return memo.length > 0 ? `${memo}; ${add}` : `${add}`
        }, '') ?? 'unknown error'
      let isValid = false
      if (Array.isArray(json.tokens)) {
        const jsonWithIndicesRemoved = json.tokens.filter((_, index) => !invalidIndices.has(index))
        if (!tokenListValidator({ ...json, tokens: jsonWithIndicesRemoved })) {
          remove<TokenInfo>(json.tokens, (token) => {
            return !tokenListValidator({ ...json, tokens: [token] })
          })
        } else {
          json.tokens = jsonWithIndicesRemoved
          isValid = true
        }
      }
      if (!isValid || !tokenListValidator(json)) {
        const validationErrors: string =
          tokenListValidator.errors?.reduce<string>((memo, error) => {
            const add = `${(error as any).dataPath} ${error.message ?? ''}`
            return memo.length > 0 ? `${memo}; ${add}` : `${add}`
          }, '') ?? 'unknown error'
        throw new Error(`Token list ${url} failed validation: ${validationErrors}`)
      } else {
        console.warn(`Token list ${url} validation failed before token filtering: ${preFilterValidationErrors}`)
      }
    }
    return json as TokenList
  }
  throw new Error('Unrecognized list URL protocol.')
}
