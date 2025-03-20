/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import { TokenList } from '@pancakeswap/token-lists'
import uriToHttp from '@pancakeswap/utils/uriToHttp'
import Ajv from 'ajv'
import schema from '../schema/pancakeswap.json'

export const validator = new Ajv({ allErrors: true }).compile(schema)

/**
 * Contains the logic for resolving a list URL to a validated token list
 * @param listUrl list url
 */
export default async function getTokenList(listUrl: string): Promise<TokenList> {
  const urls: string[] = uriToHttp(listUrl)

  for (const [i, url] of urls.entries()) {
    try {
      const json = await fetchJson(url)
      if (!validator(json)) {
        const preFilterErrors = validator.errors
        json.tokens = json.tokens.filter((token: any) => validator({ ...json, tokens: [token] }))
        if (!validator(json)) {
          const errors = validator.errors
          throw new Error(`Validation failed after filtering: ${JSON.stringify(errors)}`)
        }
        console.warn(`Pre-filter validation errors: ${JSON.stringify(preFilterErrors)}`)
      }
      return json as TokenList
    } catch (error) {
      if (i === urls.length - 1) {
        throw new Error(`Failed to download list ${listUrl}`)
      }
    }
  }
  throw new Error('Unrecognized list URL protocol.')
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`)
  return res.json()
}
