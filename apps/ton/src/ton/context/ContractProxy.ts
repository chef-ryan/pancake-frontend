import { Address, beginCell, TupleItem, TupleReader } from '@ton/core'
import snakeCase from 'lodash/snakeCase'
import { ContractClasses } from 'ton/def/contractClass.def'
import { TonContractTypes } from 'ton/ton.enums'
import { TonFunctionDef } from 'ton/ton.types'
import { Logger } from 'ton/utils/Logger'
import { TonContext } from './TonContext'

const logger = Logger.getLogger('ContractProxy')
export class ContractProxy {
  constructor(private type: TonContractTypes, private address: string, private walletAddress = '') {}

  private findFuncDef(name: string): TonFunctionDef<any> | undefined {
    const contractDef = ContractClasses[this.type]
    const interfaces = contractDef.interfaces
    return interfaces.find((x: TonFunctionDef<any>) => x.method === name)
  }

  get(_: any, prop: string) {
    if (prop === 'then') {
      return undefined
    }
    logger.debug('run get', prop)

    const fn = this.findFuncDef(prop)

    if (!fn) {
      return undefined
    }

    // TODO: For write function
    const call = async (...args: any[]) => {
      return this.callReadFunction(fn, ...args)
    }

    return call
  }

  private static getParams(fn: TonFunctionDef<any>, args: any[]): TupleItem[] {
    const params: TupleItem[] = []

    try {
      for (let i = 0; i < fn.inputs.length; i++) {
        const input = fn.inputs[i]
        switch (input.type) {
          case 'address': {
            params.push({
              type: 'slice',
              cell: beginCell().storeAddress(args[i]).endCell(),
            })
            break
          }
          case 'int':
            params.push({
              type: 'int',
              value: args[i],
            })
            break
          default:
            throw new Error(`Not support type ${input.type}`)
        }
      }
      return params
    } catch (ex) {
      console.error('Error when parse args', ex)
      throw ex
    }
  }

  private async getTonBalance() {
    const client = TonContext.instance.getClient()
    if (!this.walletAddress) {
      return null
    }
    const balance = await client.getBalance(Address.parse(this.walletAddress))
    return balance
  }

  private async callReadFunction(fn: TonFunctionDef<any>, ...args: any[]) {
    const client = TonContext.instance.getClient()
    logger.debug('contract address:', this.address, `https://testnet.tonscan.org/address/${this.address}`)

    try {
      if (this.type === TonContractTypes.NATIVE) {
        if (fn.method === 'getBalance') {
          return await this.getTonBalance()
        }
      }
      const contract = Address.parse(this.address)
      const methodName = snakeCase(fn.method)
      logger.debug('--call function--', methodName, 'with params', args)
      const params = ContractProxy.getParams(fn, args)
      const result = await client.runMethod(contract, methodName, params)
      const resolvedResult = restoreResults(fn, result.stack)
      logger.debug('result', resolvedResult)
      return resolvedResult
    } catch (ex) {
      if (typeof fn.defaultValue !== 'undefined') {
        return fn.defaultValue
      }
      console.error(`Error when calling ${fn.method} with args ${args}`)
      throw ex
    }
  }

  public async getContractState() {
    const client = TonContext.instance.getClient()
    const contract = Address.parse(this.address)
    const state = await client.getContractState(contract)
    return state
  }

  public async isContractInitialized(): Promise<boolean> {
    const state = await this.getContractState()
    return state.code !== null && state.balance !== null
  }
}

function restoreResults(fn: TonFunctionDef<any>, stack: TupleReader): any[] {
  const res: any[] = []
  for (let i = 0; i < fn.outputs.length; i++) {
    const output = fn.outputs[i]
    switch (output.type) {
      case 'address': {
        const address = stack.readAddress()
        res.push(address.toString())
        break
      }
      case 'int': {
        const val = stack.readBigNumber()
        res.push(val)
        break
      }
      default:
        throw new Error(`Not support type ${output.type}`)
    }
  }
  return res.length === 1 ? res[0] : res
}
