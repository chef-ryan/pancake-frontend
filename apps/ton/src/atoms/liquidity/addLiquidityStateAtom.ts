import { currencyFamily } from 'atoms/currencyAtoms'
import { atom } from 'jotai'
import { CurrencyField } from 'types/currency'

export const liquidityIndependentFieldAtom = atom(CurrencyField.ADD_LIQUIDITY_CURRENCY0)

export const currency0Atom = atom((get) => get(currencyFamily(CurrencyField.ADD_LIQUIDITY_CURRENCY0)))
export const currency1Atom = atom((get) => get(currencyFamily(CurrencyField.ADD_LIQUIDITY_CURRENCY1)))

// Typed Values
export const currency0TypedValue = atom('')
export const currency1TypedValue = atom('')

// Calculated Values
// interface TokenAddressArgs {
//   token0Address: string
//   token1Address: string

//   reserve0?: bigint
//   reserve1?: bigint
// }
// export const currency0CalculatedValue = atomFamily(
//   ({ token0Address, token1Address, reserve0, reserve1 }: TokenAddressArgs) =>
//     atom(
//       (get) => {
//         const independentField = get(liquidityIndependentFieldAtom)
//         const amount0 = BN(get(currency0TypedValue))
//         const amount1 = BN(get(currency1TypedValue))

//         if (
//           independentField === CurrencyField.ADD_LIQUIDITY_CURRENCY0 ||
//           !amount0.isInteger() ||
//           !amount1.isInteger() ||
//           !token0Address ||
//           !token1Address ||
//           !reserve0 ||
//           !reserve1
//         )
//           return get(currency0TypedValue)

//         // if (amount1.isZero()) return '0'

//         return amount0.times(BN(reserve1.toString())).div(reserve0.toString()).toString()
//       },
//       (_, set, value: string) => {
//         set(currency0TypedValue, value)
//         set(liquidityIndependentFieldAtom, CurrencyField.ADD_LIQUIDITY_CURRENCY0)
//       },
//     ),
// )

// export const currency1CalculatedValue = atomFamily(
//   ({ token0Address, token1Address, reserve0, reserve1 }: TokenAddressArgs) =>
//     atom(
//       (get) => {
//         const independentField = get(liquidityIndependentFieldAtom)
//         const amount1 = BN(get(currency1TypedValue))
//         const amount0 = BN(get(currency0TypedValue))

//         if (
//           independentField === CurrencyField.ADD_LIQUIDITY_CURRENCY1 ||
//           !amount0.isInteger() ||
//           !amount1.isInteger() ||
//           !token0Address ||
//           !token1Address ||
//           !reserve0 ||
//           !reserve1
//         )
//           return get(currency1TypedValue)

//         console.log('currency1calculated values', {
//           amount1: amount1.toString(),
//           amount0: amount0.toString(),
//           reserve0: reserve0.toString(),
//           reserve1: reserve1.toString(),
//           result: amount1.times(BN(reserve0.toString())).div(reserve1.toString()).toString(),
//         })
//         return amount1.times(BN(reserve0.toString())).div(reserve1.toString()).toString()
//       },
//       (_, set, value: string) => {
//         set(currency1TypedValue, value)
//         set(liquidityIndependentFieldAtom, CurrencyField.ADD_LIQUIDITY_CURRENCY1)
//       },
//     ),
// )
