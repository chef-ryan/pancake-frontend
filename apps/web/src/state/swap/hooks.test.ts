/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import { parse } from 'querystring'
import { Mock, vi } from 'vitest'
import { Field } from './actions'
import { queryParametersToSwapState } from './hooks'

describe('hooks', () => {
  describe('#queryParametersToSwapState', () => {
    test('BNB to DAI', () => {
      expect(
        queryParametersToSwapState(
          parse(
            'inputCurrency=BNB&outputCurrency=0x6b175474e89094c44da98b954eedeac495271d0f&exactAmount=20.5&exactField=outPUT',
          ),
        ),
      ).toEqual({
        [Field.OUTPUT]: { currencyId: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
        [Field.INPUT]: { currencyId: 'BNB' },
        typedValue: '20.5',
        independentField: Field.OUTPUT,
        pairDataById: {},
        derivedPairDataById: {},
        recipient: null,
      })
    })

    test('should return Native by default', () => {
      expect(queryParametersToSwapState(parse(''))).toEqual({
        [Field.OUTPUT]: { currencyId: undefined },
        [Field.INPUT]: { currencyId: 'BNB' },
        typedValue: '',
        independentField: Field.INPUT,
        pairDataById: {},
        derivedPairDataById: {},
        recipient: null,
      })
    })

    test('does not duplicate BNB for invalid output token', () => {
      expect(queryParametersToSwapState(parse('outputCurrency=invalid'), 'BNB')).toEqual({
        [Field.INPUT]: { currencyId: '' },
        [Field.OUTPUT]: { currencyId: 'BNB' },
        typedValue: '',
        independentField: Field.INPUT,
        pairDataById: {},
        derivedPairDataById: {},
        recipient: null,
      })
    })

    test('output BNB only', () => {
      expect(queryParametersToSwapState(parse('outputCurrency=bnb&exactAmount=20.5'), 'BNB')).toEqual({
        [Field.OUTPUT]: { currencyId: 'BNB' },
        [Field.INPUT]: { currencyId: '' },
        typedValue: '20.5',
        independentField: Field.INPUT,
        pairDataById: {},
        derivedPairDataById: {},
        recipient: null,
      })
    })

    test('invalid recipient', () => {
      expect(queryParametersToSwapState(parse('outputCurrency=BNB&exactAmount=20.5&recipient=abc'), 'BNB')).toEqual({
        [Field.OUTPUT]: { currencyId: 'BNB' },
        [Field.INPUT]: { currencyId: '' },
        typedValue: '20.5',
        independentField: Field.INPUT,
        pairDataById: {},
        derivedPairDataById: {},
        recipient: null,
      })
    })

    test('valid recipient', () => {
      expect(
        queryParametersToSwapState(
          parse('outputCurrency=BNB&exactAmount=20.5&recipient=0x0fF2D1eFd7A57B7562b2bf27F3f37899dB27F4a5'),
          'BNB',
        ),
      ).toEqual({
        [Field.OUTPUT]: { currencyId: 'BNB' },
        [Field.INPUT]: { currencyId: '' },
        typedValue: '20.5',
        independentField: Field.INPUT,
        pairDataById: {},
        derivedPairDataById: {},
        recipient: '0x0fF2D1eFd7A57B7562b2bf27F3f37899dB27F4a5',
      })
    })
  })
})

// weird bug on jest Reference Error, must use `var` here
var mockUseActiveWeb3React: Mock

vi.mock('../../hooks/useActiveWeb3React', () => {
  mockUseActiveWeb3React = vi.fn().mockReturnValue({
    chainId: 56,
  })
  return {
    __esModule: true,
    default: mockUseActiveWeb3React,
  }
})

var mockAccount: Mock

vi.mock('wagmi', async () => {
  mockAccount = vi.fn().mockReturnValue({})
  const original = await vi.importActual('wagmi') // Step 2.
  return {
    // @ts-ignore
    ...original,
    useAccount: mockAccount,
  }
})
