import {
  Cell,
  Slice,
  Address,
  Builder,
  beginCell,
  ComputeError,
  TupleItem,
  TupleReader,
  Dictionary,
  contractAddress,
  ContractProvider,
  Sender,
  Contract,
  ContractABI,
  ABIType,
  ABIGetter,
  ABIReceiver,
  TupleBuilder,
  DictionaryValue,
} from '@ton/core'

export type StateInit = {
  $$type: 'StateInit'
  code: Cell
  data: Cell
}

export function storeStateInit(src: StateInit) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeRef(src.code)
    b_0.storeRef(src.data)
  }
}

export function loadStateInit(slice: Slice) {
  let sc_0 = slice
  let _code = sc_0.loadRef()
  let _data = sc_0.loadRef()
  return { $$type: 'StateInit' as const, code: _code, data: _data }
}

function loadTupleStateInit(source: TupleReader) {
  let _code = source.readCell()
  let _data = source.readCell()
  return { $$type: 'StateInit' as const, code: _code, data: _data }
}

function loadGetterTupleStateInit(source: TupleReader) {
  let _code = source.readCell()
  let _data = source.readCell()
  return { $$type: 'StateInit' as const, code: _code, data: _data }
}

function storeTupleStateInit(source: StateInit) {
  let builder = new TupleBuilder()
  builder.writeCell(source.code)
  builder.writeCell(source.data)
  return builder.build()
}

function dictValueParserStateInit(): DictionaryValue<StateInit> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeStateInit(src)).endCell())
    },
    parse: (src) => {
      return loadStateInit(src.loadRef().beginParse())
    },
  }
}

export type StdAddress = {
  $$type: 'StdAddress'
  workchain: bigint
  address: bigint
}

export function storeStdAddress(src: StdAddress) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeInt(src.workchain, 8)
    b_0.storeUint(src.address, 256)
  }
}

export function loadStdAddress(slice: Slice) {
  let sc_0 = slice
  let _workchain = sc_0.loadIntBig(8)
  let _address = sc_0.loadUintBig(256)
  return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address }
}

function loadTupleStdAddress(source: TupleReader) {
  let _workchain = source.readBigNumber()
  let _address = source.readBigNumber()
  return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address }
}

function loadGetterTupleStdAddress(source: TupleReader) {
  let _workchain = source.readBigNumber()
  let _address = source.readBigNumber()
  return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address }
}

function storeTupleStdAddress(source: StdAddress) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.workchain)
  builder.writeNumber(source.address)
  return builder.build()
}

function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeStdAddress(src)).endCell())
    },
    parse: (src) => {
      return loadStdAddress(src.loadRef().beginParse())
    },
  }
}

export type VarAddress = {
  $$type: 'VarAddress'
  workchain: bigint
  address: Slice
}

export function storeVarAddress(src: VarAddress) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeInt(src.workchain, 32)
    b_0.storeRef(src.address.asCell())
  }
}

export function loadVarAddress(slice: Slice) {
  let sc_0 = slice
  let _workchain = sc_0.loadIntBig(32)
  let _address = sc_0.loadRef().asSlice()
  return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address }
}

function loadTupleVarAddress(source: TupleReader) {
  let _workchain = source.readBigNumber()
  let _address = source.readCell().asSlice()
  return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address }
}

function loadGetterTupleVarAddress(source: TupleReader) {
  let _workchain = source.readBigNumber()
  let _address = source.readCell().asSlice()
  return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address }
}

function storeTupleVarAddress(source: VarAddress) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.workchain)
  builder.writeSlice(source.address.asCell())
  return builder.build()
}

function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeVarAddress(src)).endCell())
    },
    parse: (src) => {
      return loadVarAddress(src.loadRef().beginParse())
    },
  }
}

export type Context = {
  $$type: 'Context'
  bounced: boolean
  sender: Address
  value: bigint
  raw: Slice
}

export function storeContext(src: Context) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeBit(src.bounced)
    b_0.storeAddress(src.sender)
    b_0.storeInt(src.value, 257)
    b_0.storeRef(src.raw.asCell())
  }
}

export function loadContext(slice: Slice) {
  let sc_0 = slice
  let _bounced = sc_0.loadBit()
  let _sender = sc_0.loadAddress()
  let _value = sc_0.loadIntBig(257)
  let _raw = sc_0.loadRef().asSlice()
  return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw }
}

function loadTupleContext(source: TupleReader) {
  let _bounced = source.readBoolean()
  let _sender = source.readAddress()
  let _value = source.readBigNumber()
  let _raw = source.readCell().asSlice()
  return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw }
}

function loadGetterTupleContext(source: TupleReader) {
  let _bounced = source.readBoolean()
  let _sender = source.readAddress()
  let _value = source.readBigNumber()
  let _raw = source.readCell().asSlice()
  return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw }
}

function storeTupleContext(source: Context) {
  let builder = new TupleBuilder()
  builder.writeBoolean(source.bounced)
  builder.writeAddress(source.sender)
  builder.writeNumber(source.value)
  builder.writeSlice(source.raw.asCell())
  return builder.build()
}

function dictValueParserContext(): DictionaryValue<Context> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeContext(src)).endCell())
    },
    parse: (src) => {
      return loadContext(src.loadRef().beginParse())
    },
  }
}

export type SendParameters = {
  $$type: 'SendParameters'
  bounce: boolean
  to: Address
  value: bigint
  mode: bigint
  body: Cell | null
  code: Cell | null
  data: Cell | null
}

export function storeSendParameters(src: SendParameters) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeBit(src.bounce)
    b_0.storeAddress(src.to)
    b_0.storeInt(src.value, 257)
    b_0.storeInt(src.mode, 257)
    if (src.body !== null && src.body !== undefined) {
      b_0.storeBit(true).storeRef(src.body)
    } else {
      b_0.storeBit(false)
    }
    if (src.code !== null && src.code !== undefined) {
      b_0.storeBit(true).storeRef(src.code)
    } else {
      b_0.storeBit(false)
    }
    if (src.data !== null && src.data !== undefined) {
      b_0.storeBit(true).storeRef(src.data)
    } else {
      b_0.storeBit(false)
    }
  }
}

export function loadSendParameters(slice: Slice) {
  let sc_0 = slice
  let _bounce = sc_0.loadBit()
  let _to = sc_0.loadAddress()
  let _value = sc_0.loadIntBig(257)
  let _mode = sc_0.loadIntBig(257)
  let _body = sc_0.loadBit() ? sc_0.loadRef() : null
  let _code = sc_0.loadBit() ? sc_0.loadRef() : null
  let _data = sc_0.loadBit() ? sc_0.loadRef() : null
  return {
    $$type: 'SendParameters' as const,
    bounce: _bounce,
    to: _to,
    value: _value,
    mode: _mode,
    body: _body,
    code: _code,
    data: _data,
  }
}

function loadTupleSendParameters(source: TupleReader) {
  let _bounce = source.readBoolean()
  let _to = source.readAddress()
  let _value = source.readBigNumber()
  let _mode = source.readBigNumber()
  let _body = source.readCellOpt()
  let _code = source.readCellOpt()
  let _data = source.readCellOpt()
  return {
    $$type: 'SendParameters' as const,
    bounce: _bounce,
    to: _to,
    value: _value,
    mode: _mode,
    body: _body,
    code: _code,
    data: _data,
  }
}

function loadGetterTupleSendParameters(source: TupleReader) {
  let _bounce = source.readBoolean()
  let _to = source.readAddress()
  let _value = source.readBigNumber()
  let _mode = source.readBigNumber()
  let _body = source.readCellOpt()
  let _code = source.readCellOpt()
  let _data = source.readCellOpt()
  return {
    $$type: 'SendParameters' as const,
    bounce: _bounce,
    to: _to,
    value: _value,
    mode: _mode,
    body: _body,
    code: _code,
    data: _data,
  }
}

function storeTupleSendParameters(source: SendParameters) {
  let builder = new TupleBuilder()
  builder.writeBoolean(source.bounce)
  builder.writeAddress(source.to)
  builder.writeNumber(source.value)
  builder.writeNumber(source.mode)
  builder.writeCell(source.body)
  builder.writeCell(source.code)
  builder.writeCell(source.data)
  return builder.build()
}

function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeSendParameters(src)).endCell())
    },
    parse: (src) => {
      return loadSendParameters(src.loadRef().beginParse())
    },
  }
}

export type Deploy = {
  $$type: 'Deploy'
  queryId: bigint
}

export function storeDeploy(src: Deploy) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(2490013878, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadDeploy(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 2490013878) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'Deploy' as const, queryId: _queryId }
}

function loadTupleDeploy(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'Deploy' as const, queryId: _queryId }
}

function loadGetterTupleDeploy(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'Deploy' as const, queryId: _queryId }
}

function storeTupleDeploy(source: Deploy) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserDeploy(): DictionaryValue<Deploy> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeDeploy(src)).endCell())
    },
    parse: (src) => {
      return loadDeploy(src.loadRef().beginParse())
    },
  }
}

export type DeployOk = {
  $$type: 'DeployOk'
  queryId: bigint
}

export function storeDeployOk(src: DeployOk) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(2952335191, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadDeployOk(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 2952335191) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'DeployOk' as const, queryId: _queryId }
}

function loadTupleDeployOk(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'DeployOk' as const, queryId: _queryId }
}

function loadGetterTupleDeployOk(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'DeployOk' as const, queryId: _queryId }
}

function storeTupleDeployOk(source: DeployOk) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeDeployOk(src)).endCell())
    },
    parse: (src) => {
      return loadDeployOk(src.loadRef().beginParse())
    },
  }
}

export type FactoryDeploy = {
  $$type: 'FactoryDeploy'
  queryId: bigint
  cashback: Address
}

export function storeFactoryDeploy(src: FactoryDeploy) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(1829761339, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.cashback)
  }
}

export function loadFactoryDeploy(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 1829761339) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _cashback = sc_0.loadAddress()
  return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback }
}

function loadTupleFactoryDeploy(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _cashback = source.readAddress()
  return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback }
}

function loadGetterTupleFactoryDeploy(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _cashback = source.readAddress()
  return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback }
}

function storeTupleFactoryDeploy(source: FactoryDeploy) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.cashback)
  return builder.build()
}

function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell())
    },
    parse: (src) => {
      return loadFactoryDeploy(src.loadRef().beginParse())
    },
  }
}

export type PayTo = {
  $$type: 'PayTo'
  queryId: bigint
  owner: Address
  exitCode: bigint
  amount0Out: bigint
  token0Address: Address
  amount1Out: bigint
  token1Address: Address
}

export function storePayTo(src: PayTo) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3545769723, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.owner)
    b_0.storeUint(src.exitCode, 32)
    b_0.storeCoins(src.amount0Out)
    b_0.storeAddress(src.token0Address)
    b_0.storeCoins(src.amount1Out)
    let b_1 = new Builder()
    b_1.storeAddress(src.token1Address)
    b_0.storeRef(b_1.endCell())
  }
}

export function loadPayTo(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3545769723) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _owner = sc_0.loadAddress()
  let _exitCode = sc_0.loadUintBig(32)
  let _amount0Out = sc_0.loadCoins()
  let _token0Address = sc_0.loadAddress()
  let _amount1Out = sc_0.loadCoins()
  let sc_1 = sc_0.loadRef().beginParse()
  let _token1Address = sc_1.loadAddress()
  return {
    $$type: 'PayTo' as const,
    queryId: _queryId,
    owner: _owner,
    exitCode: _exitCode,
    amount0Out: _amount0Out,
    token0Address: _token0Address,
    amount1Out: _amount1Out,
    token1Address: _token1Address,
  }
}

function loadTuplePayTo(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _owner = source.readAddress()
  let _exitCode = source.readBigNumber()
  let _amount0Out = source.readBigNumber()
  let _token0Address = source.readAddress()
  let _amount1Out = source.readBigNumber()
  let _token1Address = source.readAddress()
  return {
    $$type: 'PayTo' as const,
    queryId: _queryId,
    owner: _owner,
    exitCode: _exitCode,
    amount0Out: _amount0Out,
    token0Address: _token0Address,
    amount1Out: _amount1Out,
    token1Address: _token1Address,
  }
}

function loadGetterTuplePayTo(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _owner = source.readAddress()
  let _exitCode = source.readBigNumber()
  let _amount0Out = source.readBigNumber()
  let _token0Address = source.readAddress()
  let _amount1Out = source.readBigNumber()
  let _token1Address = source.readAddress()
  return {
    $$type: 'PayTo' as const,
    queryId: _queryId,
    owner: _owner,
    exitCode: _exitCode,
    amount0Out: _amount0Out,
    token0Address: _token0Address,
    amount1Out: _amount1Out,
    token1Address: _token1Address,
  }
}

function storeTuplePayTo(source: PayTo) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.owner)
  builder.writeNumber(source.exitCode)
  builder.writeNumber(source.amount0Out)
  builder.writeAddress(source.token0Address)
  builder.writeNumber(source.amount1Out)
  builder.writeAddress(source.token1Address)
  return builder.build()
}

function dictValueParserPayTo(): DictionaryValue<PayTo> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storePayTo(src)).endCell())
    },
    parse: (src) => {
      return loadPayTo(src.loadRef().beginParse())
    },
  }
}

export type SetFees = {
  $$type: 'SetFees'
  queryId: bigint
  newLpFee: bigint
  newProtocolFee: bigint
  newRefFee: bigint
  newProtocolFeeAddress: Address
  jettonWallet0: Address
  jettonWallet1: Address
}

export function storeSetFees(src: SetFees) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3128916783, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeCoins(src.newLpFee)
    b_0.storeCoins(src.newProtocolFee)
    b_0.storeCoins(src.newRefFee)
    b_0.storeAddress(src.newProtocolFeeAddress)
    b_0.storeAddress(src.jettonWallet0)
    let b_1 = new Builder()
    b_1.storeAddress(src.jettonWallet1)
    b_0.storeRef(b_1.endCell())
  }
}

export function loadSetFees(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3128916783) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _newLpFee = sc_0.loadCoins()
  let _newProtocolFee = sc_0.loadCoins()
  let _newRefFee = sc_0.loadCoins()
  let _newProtocolFeeAddress = sc_0.loadAddress()
  let _jettonWallet0 = sc_0.loadAddress()
  let sc_1 = sc_0.loadRef().beginParse()
  let _jettonWallet1 = sc_1.loadAddress()
  return {
    $$type: 'SetFees' as const,
    queryId: _queryId,
    newLpFee: _newLpFee,
    newProtocolFee: _newProtocolFee,
    newRefFee: _newRefFee,
    newProtocolFeeAddress: _newProtocolFeeAddress,
    jettonWallet0: _jettonWallet0,
    jettonWallet1: _jettonWallet1,
  }
}

function loadTupleSetFees(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _newLpFee = source.readBigNumber()
  let _newProtocolFee = source.readBigNumber()
  let _newRefFee = source.readBigNumber()
  let _newProtocolFeeAddress = source.readAddress()
  let _jettonWallet0 = source.readAddress()
  let _jettonWallet1 = source.readAddress()
  return {
    $$type: 'SetFees' as const,
    queryId: _queryId,
    newLpFee: _newLpFee,
    newProtocolFee: _newProtocolFee,
    newRefFee: _newRefFee,
    newProtocolFeeAddress: _newProtocolFeeAddress,
    jettonWallet0: _jettonWallet0,
    jettonWallet1: _jettonWallet1,
  }
}

function loadGetterTupleSetFees(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _newLpFee = source.readBigNumber()
  let _newProtocolFee = source.readBigNumber()
  let _newRefFee = source.readBigNumber()
  let _newProtocolFeeAddress = source.readAddress()
  let _jettonWallet0 = source.readAddress()
  let _jettonWallet1 = source.readAddress()
  return {
    $$type: 'SetFees' as const,
    queryId: _queryId,
    newLpFee: _newLpFee,
    newProtocolFee: _newProtocolFee,
    newRefFee: _newRefFee,
    newProtocolFeeAddress: _newProtocolFeeAddress,
    jettonWallet0: _jettonWallet0,
    jettonWallet1: _jettonWallet1,
  }
}

function storeTupleSetFees(source: SetFees) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.newLpFee)
  builder.writeNumber(source.newProtocolFee)
  builder.writeNumber(source.newRefFee)
  builder.writeAddress(source.newProtocolFeeAddress)
  builder.writeAddress(source.jettonWallet0)
  builder.writeAddress(source.jettonWallet1)
  return builder.build()
}

function dictValueParserSetFees(): DictionaryValue<SetFees> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeSetFees(src)).endCell())
    },
    parse: (src) => {
      return loadSetFees(src.loadRef().beginParse())
    },
  }
}

export type CollectFees = {
  $$type: 'CollectFees'
  queryId: bigint
  jettonWallet0: Address
  jettonWallet1: Address
}

export function storeCollectFees(src: CollectFees) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3697015726, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.jettonWallet0)
    b_0.storeAddress(src.jettonWallet1)
  }
}

export function loadCollectFees(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3697015726) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _jettonWallet0 = sc_0.loadAddress()
  let _jettonWallet1 = sc_0.loadAddress()
  return {
    $$type: 'CollectFees' as const,
    queryId: _queryId,
    jettonWallet0: _jettonWallet0,
    jettonWallet1: _jettonWallet1,
  }
}

function loadTupleCollectFees(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _jettonWallet0 = source.readAddress()
  let _jettonWallet1 = source.readAddress()
  return {
    $$type: 'CollectFees' as const,
    queryId: _queryId,
    jettonWallet0: _jettonWallet0,
    jettonWallet1: _jettonWallet1,
  }
}

function loadGetterTupleCollectFees(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _jettonWallet0 = source.readAddress()
  let _jettonWallet1 = source.readAddress()
  return {
    $$type: 'CollectFees' as const,
    queryId: _queryId,
    jettonWallet0: _jettonWallet0,
    jettonWallet1: _jettonWallet1,
  }
}

function storeTupleCollectFees(source: CollectFees) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.jettonWallet0)
  builder.writeAddress(source.jettonWallet1)
  return builder.build()
}

function dictValueParserCollectFees(): DictionaryValue<CollectFees> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeCollectFees(src)).endCell())
    },
    parse: (src) => {
      return loadCollectFees(src.loadRef().beginParse())
    },
  }
}

export type Lock = {
  $$type: 'Lock'
  queryId: bigint
}

export function storeLock(src: Lock) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(2103081517, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadLock(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 2103081517) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'Lock' as const, queryId: _queryId }
}

function loadTupleLock(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'Lock' as const, queryId: _queryId }
}

function loadGetterTupleLock(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'Lock' as const, queryId: _queryId }
}

function storeTupleLock(source: Lock) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserLock(): DictionaryValue<Lock> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeLock(src)).endCell())
    },
    parse: (src) => {
      return loadLock(src.loadRef().beginParse())
    },
  }
}

export type Unlock = {
  $$type: 'Unlock'
  queryId: bigint
}

export function storeUnlock(src: Unlock) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(2018129546, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadUnlock(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 2018129546) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'Unlock' as const, queryId: _queryId }
}

function loadTupleUnlock(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'Unlock' as const, queryId: _queryId }
}

function loadGetterTupleUnlock(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'Unlock' as const, queryId: _queryId }
}

function storeTupleUnlock(source: Unlock) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserUnlock(): DictionaryValue<Unlock> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeUnlock(src)).endCell())
    },
    parse: (src) => {
      return loadUnlock(src.loadRef().beginParse())
    },
  }
}

export type RouterResetGas = {
  $$type: 'RouterResetGas'
  queryId: bigint
}

export function storeRouterResetGas(src: RouterResetGas) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3005576342, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadRouterResetGas(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3005576342) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'RouterResetGas' as const, queryId: _queryId }
}

function loadTupleRouterResetGas(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'RouterResetGas' as const, queryId: _queryId }
}

function loadGetterTupleRouterResetGas(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'RouterResetGas' as const, queryId: _queryId }
}

function storeTupleRouterResetGas(source: RouterResetGas) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserRouterResetGas(): DictionaryValue<RouterResetGas> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeRouterResetGas(src)).endCell())
    },
    parse: (src) => {
      return loadRouterResetGas(src.loadRef().beginParse())
    },
  }
}

export type ResetPoolGas = {
  $$type: 'ResetPoolGas'
  queryId: bigint
  jettonWallet0: Address
  jettonWallet1: Address
}

export function storeResetPoolGas(src: ResetPoolGas) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(2667682037, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.jettonWallet0)
    b_0.storeAddress(src.jettonWallet1)
  }
}

export function loadResetPoolGas(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 2667682037) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _jettonWallet0 = sc_0.loadAddress()
  let _jettonWallet1 = sc_0.loadAddress()
  return {
    $$type: 'ResetPoolGas' as const,
    queryId: _queryId,
    jettonWallet0: _jettonWallet0,
    jettonWallet1: _jettonWallet1,
  }
}

function loadTupleResetPoolGas(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _jettonWallet0 = source.readAddress()
  let _jettonWallet1 = source.readAddress()
  return {
    $$type: 'ResetPoolGas' as const,
    queryId: _queryId,
    jettonWallet0: _jettonWallet0,
    jettonWallet1: _jettonWallet1,
  }
}

function loadGetterTupleResetPoolGas(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _jettonWallet0 = source.readAddress()
  let _jettonWallet1 = source.readAddress()
  return {
    $$type: 'ResetPoolGas' as const,
    queryId: _queryId,
    jettonWallet0: _jettonWallet0,
    jettonWallet1: _jettonWallet1,
  }
}

function storeTupleResetPoolGas(source: ResetPoolGas) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.jettonWallet0)
  builder.writeAddress(source.jettonWallet1)
  return builder.build()
}

function dictValueParserResetPoolGas(): DictionaryValue<ResetPoolGas> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeResetPoolGas(src)).endCell())
    },
    parse: (src) => {
      return loadResetPoolGas(src.loadRef().beginParse())
    },
  }
}

export type GetterPoolAddress = {
  $$type: 'GetterPoolAddress'
  queryId: bigint
  token0: Address
  token1: Address
}

export function storeGetterPoolAddress(src: GetterPoolAddress) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(356176588, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.token0)
    b_0.storeAddress(src.token1)
  }
}

export function loadGetterPoolAddress(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 356176588) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _token0 = sc_0.loadAddress()
  let _token1 = sc_0.loadAddress()
  return { $$type: 'GetterPoolAddress' as const, queryId: _queryId, token0: _token0, token1: _token1 }
}

function loadTupleGetterPoolAddress(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _token0 = source.readAddress()
  let _token1 = source.readAddress()
  return { $$type: 'GetterPoolAddress' as const, queryId: _queryId, token0: _token0, token1: _token1 }
}

function loadGetterTupleGetterPoolAddress(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _token0 = source.readAddress()
  let _token1 = source.readAddress()
  return { $$type: 'GetterPoolAddress' as const, queryId: _queryId, token0: _token0, token1: _token1 }
}

function storeTupleGetterPoolAddress(source: GetterPoolAddress) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.token0)
  builder.writeAddress(source.token1)
  return builder.build()
}

function dictValueParserGetterPoolAddress(): DictionaryValue<GetterPoolAddress> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeGetterPoolAddress(src)).endCell())
    },
    parse: (src) => {
      return loadGetterPoolAddress(src.loadRef().beginParse())
    },
  }
}

export type PoolAddress = {
  $$type: 'PoolAddress'
  queryId: bigint
  poolAddress: Address
}

export function storePoolAddress(src: PoolAddress) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(832067646, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.poolAddress)
  }
}

export function loadPoolAddress(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 832067646) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _poolAddress = sc_0.loadAddress()
  return { $$type: 'PoolAddress' as const, queryId: _queryId, poolAddress: _poolAddress }
}

function loadTuplePoolAddress(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _poolAddress = source.readAddress()
  return { $$type: 'PoolAddress' as const, queryId: _queryId, poolAddress: _poolAddress }
}

function loadGetterTuplePoolAddress(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _poolAddress = source.readAddress()
  return { $$type: 'PoolAddress' as const, queryId: _queryId, poolAddress: _poolAddress }
}

function storeTuplePoolAddress(source: PoolAddress) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.poolAddress)
  return builder.build()
}

function dictValueParserPoolAddress(): DictionaryValue<PoolAddress> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storePoolAddress(src)).endCell())
    },
    parse: (src) => {
      return loadPoolAddress(src.loadRef().beginParse())
    },
  }
}

export type InitCodeUpgrade = {
  $$type: 'InitCodeUpgrade'
  queryId: bigint
  code: Cell
}

export function storeInitCodeUpgrade(src: InitCodeUpgrade) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(316241174, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeRef(src.code)
  }
}

export function loadInitCodeUpgrade(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 316241174) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _code = sc_0.loadRef()
  return { $$type: 'InitCodeUpgrade' as const, queryId: _queryId, code: _code }
}

function loadTupleInitCodeUpgrade(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _code = source.readCell()
  return { $$type: 'InitCodeUpgrade' as const, queryId: _queryId, code: _code }
}

function loadGetterTupleInitCodeUpgrade(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _code = source.readCell()
  return { $$type: 'InitCodeUpgrade' as const, queryId: _queryId, code: _code }
}

function storeTupleInitCodeUpgrade(source: InitCodeUpgrade) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeCell(source.code)
  return builder.build()
}

function dictValueParserInitCodeUpgrade(): DictionaryValue<InitCodeUpgrade> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeInitCodeUpgrade(src)).endCell())
    },
    parse: (src) => {
      return loadInitCodeUpgrade(src.loadRef().beginParse())
    },
  }
}

export type InitAdminUpgrade = {
  $$type: 'InitAdminUpgrade'
  queryId: bigint
  admin: Address
}

export function storeInitAdminUpgrade(src: InitAdminUpgrade) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(2151328254, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.admin)
  }
}

export function loadInitAdminUpgrade(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 2151328254) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _admin = sc_0.loadAddress()
  return { $$type: 'InitAdminUpgrade' as const, queryId: _queryId, admin: _admin }
}

function loadTupleInitAdminUpgrade(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _admin = source.readAddress()
  return { $$type: 'InitAdminUpgrade' as const, queryId: _queryId, admin: _admin }
}

function loadGetterTupleInitAdminUpgrade(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _admin = source.readAddress()
  return { $$type: 'InitAdminUpgrade' as const, queryId: _queryId, admin: _admin }
}

function storeTupleInitAdminUpgrade(source: InitAdminUpgrade) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.admin)
  return builder.build()
}

function dictValueParserInitAdminUpgrade(): DictionaryValue<InitAdminUpgrade> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeInitAdminUpgrade(src)).endCell())
    },
    parse: (src) => {
      return loadInitAdminUpgrade(src.loadRef().beginParse())
    },
  }
}

export type CancelAdminUpgrade = {
  $$type: 'CancelAdminUpgrade'
  queryId: bigint
}

export function storeCancelAdminUpgrade(src: CancelAdminUpgrade) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3445886299, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadCancelAdminUpgrade(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3445886299) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'CancelAdminUpgrade' as const, queryId: _queryId }
}

function loadTupleCancelAdminUpgrade(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'CancelAdminUpgrade' as const, queryId: _queryId }
}

function loadGetterTupleCancelAdminUpgrade(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'CancelAdminUpgrade' as const, queryId: _queryId }
}

function storeTupleCancelAdminUpgrade(source: CancelAdminUpgrade) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserCancelAdminUpgrade(): DictionaryValue<CancelAdminUpgrade> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeCancelAdminUpgrade(src)).endCell())
    },
    parse: (src) => {
      return loadCancelAdminUpgrade(src.loadRef().beginParse())
    },
  }
}

export type CancelCodeUpgrade = {
  $$type: 'CancelCodeUpgrade'
  queryId: bigint
}

export function storeCancelCodeUpgrade(src: CancelCodeUpgrade) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3663952823, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadCancelCodeUpgrade(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3663952823) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'CancelCodeUpgrade' as const, queryId: _queryId }
}

function loadTupleCancelCodeUpgrade(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'CancelCodeUpgrade' as const, queryId: _queryId }
}

function loadGetterTupleCancelCodeUpgrade(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'CancelCodeUpgrade' as const, queryId: _queryId }
}

function storeTupleCancelCodeUpgrade(source: CancelCodeUpgrade) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserCancelCodeUpgrade(): DictionaryValue<CancelCodeUpgrade> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeCancelCodeUpgrade(src)).endCell())
    },
    parse: (src) => {
      return loadCancelCodeUpgrade(src.loadRef().beginParse())
    },
  }
}

export type FinalizeUpgrades = {
  $$type: 'FinalizeUpgrades'
  queryId: bigint
}

export function storeFinalizeUpgrades(src: FinalizeUpgrades) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3373754125, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadFinalizeUpgrades(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3373754125) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'FinalizeUpgrades' as const, queryId: _queryId }
}

function loadTupleFinalizeUpgrades(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'FinalizeUpgrades' as const, queryId: _queryId }
}

function loadGetterTupleFinalizeUpgrades(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'FinalizeUpgrades' as const, queryId: _queryId }
}

function storeTupleFinalizeUpgrades(source: FinalizeUpgrades) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserFinalizeUpgrades(): DictionaryValue<FinalizeUpgrades> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeFinalizeUpgrades(src)).endCell())
    },
    parse: (src) => {
      return loadFinalizeUpgrades(src.loadRef().beginParse())
    },
  }
}

export type Swap = {
  $$type: 'Swap'
  queryId: bigint
  fromUserAddress: Address
  tokenWallet: Address
  amount: bigint
  minOut: bigint
  fromRealUser: Address
  refAddress: Address | null
  refMessageValue: bigint
  next: SwapNext | null
}

export function storeSwap(src: Swap) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3827326903, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.fromUserAddress)
    b_0.storeAddress(src.tokenWallet)
    b_0.storeCoins(src.amount)
    b_0.storeCoins(src.minOut)
    let b_1 = new Builder()
    b_1.storeAddress(src.fromRealUser)
    b_1.storeAddress(src.refAddress)
    b_1.storeCoins(src.refMessageValue)
    let b_2 = new Builder()
    if (src.next !== null && src.next !== undefined) {
      b_2.storeBit(true)
      b_2.store(storeSwapNext(src.next))
    } else {
      b_2.storeBit(false)
    }
    b_1.storeRef(b_2.endCell())
    b_0.storeRef(b_1.endCell())
  }
}

export function loadSwap(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3827326903) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _fromUserAddress = sc_0.loadAddress()
  let _tokenWallet = sc_0.loadAddress()
  let _amount = sc_0.loadCoins()
  let _minOut = sc_0.loadCoins()
  let sc_1 = sc_0.loadRef().beginParse()
  let _fromRealUser = sc_1.loadAddress()
  let _refAddress = sc_1.loadMaybeAddress()
  let _refMessageValue = sc_1.loadCoins()
  let sc_2 = sc_1.loadRef().beginParse()
  let _next = sc_2.loadBit() ? loadSwapNext(sc_2) : null
  return {
    $$type: 'Swap' as const,
    queryId: _queryId,
    fromUserAddress: _fromUserAddress,
    tokenWallet: _tokenWallet,
    amount: _amount,
    minOut: _minOut,
    fromRealUser: _fromRealUser,
    refAddress: _refAddress,
    refMessageValue: _refMessageValue,
    next: _next,
  }
}

function loadTupleSwap(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _fromUserAddress = source.readAddress()
  let _tokenWallet = source.readAddress()
  let _amount = source.readBigNumber()
  let _minOut = source.readBigNumber()
  let _fromRealUser = source.readAddress()
  let _refAddress = source.readAddressOpt()
  let _refMessageValue = source.readBigNumber()
  const _next_p = source.readTupleOpt()
  const _next = _next_p ? loadTupleSwapNext(_next_p) : null
  return {
    $$type: 'Swap' as const,
    queryId: _queryId,
    fromUserAddress: _fromUserAddress,
    tokenWallet: _tokenWallet,
    amount: _amount,
    minOut: _minOut,
    fromRealUser: _fromRealUser,
    refAddress: _refAddress,
    refMessageValue: _refMessageValue,
    next: _next,
  }
}

function loadGetterTupleSwap(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _fromUserAddress = source.readAddress()
  let _tokenWallet = source.readAddress()
  let _amount = source.readBigNumber()
  let _minOut = source.readBigNumber()
  let _fromRealUser = source.readAddress()
  let _refAddress = source.readAddressOpt()
  let _refMessageValue = source.readBigNumber()
  const _next_p = source.readTupleOpt()
  const _next = _next_p ? loadTupleSwapNext(_next_p) : null
  return {
    $$type: 'Swap' as const,
    queryId: _queryId,
    fromUserAddress: _fromUserAddress,
    tokenWallet: _tokenWallet,
    amount: _amount,
    minOut: _minOut,
    fromRealUser: _fromRealUser,
    refAddress: _refAddress,
    refMessageValue: _refMessageValue,
    next: _next,
  }
}

function storeTupleSwap(source: Swap) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.fromUserAddress)
  builder.writeAddress(source.tokenWallet)
  builder.writeNumber(source.amount)
  builder.writeNumber(source.minOut)
  builder.writeAddress(source.fromRealUser)
  builder.writeAddress(source.refAddress)
  builder.writeNumber(source.refMessageValue)
  if (source.next !== null && source.next !== undefined) {
    builder.writeTuple(storeTupleSwapNext(source.next))
  } else {
    builder.writeTuple(null)
  }
  return builder.build()
}

function dictValueParserSwap(): DictionaryValue<Swap> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeSwap(src)).endCell())
    },
    parse: (src) => {
      return loadSwap(src.loadRef().beginParse())
    },
  }
}

export type CbSwap = {
  $$type: 'CbSwap'
  queryId: bigint
  fromUserAddress: Address
  sourceTokenWallet: Address
  tokenWallet: Address
  amount: bigint
  fromRealUser: Address
  refAddress: Address | null
  refMessageValue: bigint
  next: SwapNext
}

export function storeCbSwap(src: CbSwap) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(1914768698, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.fromUserAddress)
    b_0.storeAddress(src.sourceTokenWallet)
    b_0.storeAddress(src.tokenWallet)
    b_0.storeCoins(src.amount)
    let b_1 = new Builder()
    b_1.storeAddress(src.fromRealUser)
    b_1.storeAddress(src.refAddress)
    b_1.storeCoins(src.refMessageValue)
    let b_2 = new Builder()
    b_2.store(storeSwapNext(src.next))
    b_1.storeRef(b_2.endCell())
    b_0.storeRef(b_1.endCell())
  }
}

export function loadCbSwap(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 1914768698) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _fromUserAddress = sc_0.loadAddress()
  let _sourceTokenWallet = sc_0.loadAddress()
  let _tokenWallet = sc_0.loadAddress()
  let _amount = sc_0.loadCoins()
  let sc_1 = sc_0.loadRef().beginParse()
  let _fromRealUser = sc_1.loadAddress()
  let _refAddress = sc_1.loadMaybeAddress()
  let _refMessageValue = sc_1.loadCoins()
  let sc_2 = sc_1.loadRef().beginParse()
  let _next = loadSwapNext(sc_2)
  return {
    $$type: 'CbSwap' as const,
    queryId: _queryId,
    fromUserAddress: _fromUserAddress,
    sourceTokenWallet: _sourceTokenWallet,
    tokenWallet: _tokenWallet,
    amount: _amount,
    fromRealUser: _fromRealUser,
    refAddress: _refAddress,
    refMessageValue: _refMessageValue,
    next: _next,
  }
}

function loadTupleCbSwap(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _fromUserAddress = source.readAddress()
  let _sourceTokenWallet = source.readAddress()
  let _tokenWallet = source.readAddress()
  let _amount = source.readBigNumber()
  let _fromRealUser = source.readAddress()
  let _refAddress = source.readAddressOpt()
  let _refMessageValue = source.readBigNumber()
  const _next = loadTupleSwapNext(source)
  return {
    $$type: 'CbSwap' as const,
    queryId: _queryId,
    fromUserAddress: _fromUserAddress,
    sourceTokenWallet: _sourceTokenWallet,
    tokenWallet: _tokenWallet,
    amount: _amount,
    fromRealUser: _fromRealUser,
    refAddress: _refAddress,
    refMessageValue: _refMessageValue,
    next: _next,
  }
}

function loadGetterTupleCbSwap(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _fromUserAddress = source.readAddress()
  let _sourceTokenWallet = source.readAddress()
  let _tokenWallet = source.readAddress()
  let _amount = source.readBigNumber()
  let _fromRealUser = source.readAddress()
  let _refAddress = source.readAddressOpt()
  let _refMessageValue = source.readBigNumber()
  const _next = loadGetterTupleSwapNext(source)
  return {
    $$type: 'CbSwap' as const,
    queryId: _queryId,
    fromUserAddress: _fromUserAddress,
    sourceTokenWallet: _sourceTokenWallet,
    tokenWallet: _tokenWallet,
    amount: _amount,
    fromRealUser: _fromRealUser,
    refAddress: _refAddress,
    refMessageValue: _refMessageValue,
    next: _next,
  }
}

function storeTupleCbSwap(source: CbSwap) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.fromUserAddress)
  builder.writeAddress(source.sourceTokenWallet)
  builder.writeAddress(source.tokenWallet)
  builder.writeNumber(source.amount)
  builder.writeAddress(source.fromRealUser)
  builder.writeAddress(source.refAddress)
  builder.writeNumber(source.refMessageValue)
  builder.writeTuple(storeTupleSwapNext(source.next))
  return builder.build()
}

function dictValueParserCbSwap(): DictionaryValue<CbSwap> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeCbSwap(src)).endCell())
    },
    parse: (src) => {
      return loadCbSwap(src.loadRef().beginParse())
    },
  }
}

export type SwapNext = {
  $$type: 'SwapNext'
  tokenAddress: Address
  minOut: bigint
  next: Cell | null
}

export function storeSwapNext(src: SwapNext) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeAddress(src.tokenAddress)
    b_0.storeCoins(src.minOut)
    if (src.next !== null && src.next !== undefined) {
      b_0.storeBit(true).storeRef(src.next)
    } else {
      b_0.storeBit(false)
    }
  }
}

export function loadSwapNext(slice: Slice) {
  let sc_0 = slice
  let _tokenAddress = sc_0.loadAddress()
  let _minOut = sc_0.loadCoins()
  let _next = sc_0.loadBit() ? sc_0.loadRef() : null
  return { $$type: 'SwapNext' as const, tokenAddress: _tokenAddress, minOut: _minOut, next: _next }
}

function loadTupleSwapNext(source: TupleReader) {
  let _tokenAddress = source.readAddress()
  let _minOut = source.readBigNumber()
  let _next = source.readCellOpt()
  return { $$type: 'SwapNext' as const, tokenAddress: _tokenAddress, minOut: _minOut, next: _next }
}

function loadGetterTupleSwapNext(source: TupleReader) {
  let _tokenAddress = source.readAddress()
  let _minOut = source.readBigNumber()
  let _next = source.readCellOpt()
  return { $$type: 'SwapNext' as const, tokenAddress: _tokenAddress, minOut: _minOut, next: _next }
}

function storeTupleSwapNext(source: SwapNext) {
  let builder = new TupleBuilder()
  builder.writeAddress(source.tokenAddress)
  builder.writeNumber(source.minOut)
  builder.writeCell(source.next)
  return builder.build()
}

function dictValueParserSwapNext(): DictionaryValue<SwapNext> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeSwapNext(src)).endCell())
    },
    parse: (src) => {
      return loadSwapNext(src.loadRef().beginParse())
    },
  }
}

export type ProvideLpOnSingleSide = {
  $$type: 'ProvideLpOnSingleSide'
  queryId: bigint
  ownerAddress: Address
  minLpOut: bigint
  amount0: bigint
  amount1: bigint
}

export function storeProvideLpOnSingleSide(src: ProvideLpOnSingleSide) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3370913140, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.ownerAddress)
    b_0.storeCoins(src.minLpOut)
    b_0.storeCoins(src.amount0)
    b_0.storeCoins(src.amount1)
  }
}

export function loadProvideLpOnSingleSide(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3370913140) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _ownerAddress = sc_0.loadAddress()
  let _minLpOut = sc_0.loadCoins()
  let _amount0 = sc_0.loadCoins()
  let _amount1 = sc_0.loadCoins()
  return {
    $$type: 'ProvideLpOnSingleSide' as const,
    queryId: _queryId,
    ownerAddress: _ownerAddress,
    minLpOut: _minLpOut,
    amount0: _amount0,
    amount1: _amount1,
  }
}

function loadTupleProvideLpOnSingleSide(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _ownerAddress = source.readAddress()
  let _minLpOut = source.readBigNumber()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  return {
    $$type: 'ProvideLpOnSingleSide' as const,
    queryId: _queryId,
    ownerAddress: _ownerAddress,
    minLpOut: _minLpOut,
    amount0: _amount0,
    amount1: _amount1,
  }
}

function loadGetterTupleProvideLpOnSingleSide(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _ownerAddress = source.readAddress()
  let _minLpOut = source.readBigNumber()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  return {
    $$type: 'ProvideLpOnSingleSide' as const,
    queryId: _queryId,
    ownerAddress: _ownerAddress,
    minLpOut: _minLpOut,
    amount0: _amount0,
    amount1: _amount1,
  }
}

function storeTupleProvideLpOnSingleSide(source: ProvideLpOnSingleSide) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.ownerAddress)
  builder.writeNumber(source.minLpOut)
  builder.writeNumber(source.amount0)
  builder.writeNumber(source.amount1)
  return builder.build()
}

function dictValueParserProvideLpOnSingleSide(): DictionaryValue<ProvideLpOnSingleSide> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeProvideLpOnSingleSide(src)).endCell())
    },
    parse: (src) => {
      return loadProvideLpOnSingleSide(src.loadRef().beginParse())
    },
  }
}

export type SetFeesFromRouter = {
  $$type: 'SetFeesFromRouter'
  queryId: bigint
  newLpFee: bigint
  newProtocolFee: bigint
  newRefFee: bigint
  newProtocolFeeAddress: Address
}

export function storeSetFeesFromRouter(src: SetFeesFromRouter) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(2108703573, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeCoins(src.newLpFee)
    b_0.storeCoins(src.newProtocolFee)
    b_0.storeCoins(src.newRefFee)
    b_0.storeAddress(src.newProtocolFeeAddress)
  }
}

export function loadSetFeesFromRouter(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 2108703573) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _newLpFee = sc_0.loadCoins()
  let _newProtocolFee = sc_0.loadCoins()
  let _newRefFee = sc_0.loadCoins()
  let _newProtocolFeeAddress = sc_0.loadAddress()
  return {
    $$type: 'SetFeesFromRouter' as const,
    queryId: _queryId,
    newLpFee: _newLpFee,
    newProtocolFee: _newProtocolFee,
    newRefFee: _newRefFee,
    newProtocolFeeAddress: _newProtocolFeeAddress,
  }
}

function loadTupleSetFeesFromRouter(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _newLpFee = source.readBigNumber()
  let _newProtocolFee = source.readBigNumber()
  let _newRefFee = source.readBigNumber()
  let _newProtocolFeeAddress = source.readAddress()
  return {
    $$type: 'SetFeesFromRouter' as const,
    queryId: _queryId,
    newLpFee: _newLpFee,
    newProtocolFee: _newProtocolFee,
    newRefFee: _newRefFee,
    newProtocolFeeAddress: _newProtocolFeeAddress,
  }
}

function loadGetterTupleSetFeesFromRouter(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _newLpFee = source.readBigNumber()
  let _newProtocolFee = source.readBigNumber()
  let _newRefFee = source.readBigNumber()
  let _newProtocolFeeAddress = source.readAddress()
  return {
    $$type: 'SetFeesFromRouter' as const,
    queryId: _queryId,
    newLpFee: _newLpFee,
    newProtocolFee: _newProtocolFee,
    newRefFee: _newRefFee,
    newProtocolFeeAddress: _newProtocolFeeAddress,
  }
}

function storeTupleSetFeesFromRouter(source: SetFeesFromRouter) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.newLpFee)
  builder.writeNumber(source.newProtocolFee)
  builder.writeNumber(source.newRefFee)
  builder.writeAddress(source.newProtocolFeeAddress)
  return builder.build()
}

function dictValueParserSetFeesFromRouter(): DictionaryValue<SetFeesFromRouter> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeSetFeesFromRouter(src)).endCell())
    },
    parse: (src) => {
      return loadSetFeesFromRouter(src.loadRef().beginParse())
    },
  }
}

export type CollectFeesFromRouter = {
  $$type: 'CollectFeesFromRouter'
  queryId: bigint
}

export function storeCollectFeesFromRouter(src: CollectFeesFromRouter) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(521459934, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadCollectFeesFromRouter(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 521459934) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'CollectFeesFromRouter' as const, queryId: _queryId }
}

function loadTupleCollectFeesFromRouter(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'CollectFeesFromRouter' as const, queryId: _queryId }
}

function loadGetterTupleCollectFeesFromRouter(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'CollectFeesFromRouter' as const, queryId: _queryId }
}

function storeTupleCollectFeesFromRouter(source: CollectFeesFromRouter) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserCollectFeesFromRouter(): DictionaryValue<CollectFeesFromRouter> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeCollectFeesFromRouter(src)).endCell())
    },
    parse: (src) => {
      return loadCollectFeesFromRouter(src.loadRef().beginParse())
    },
  }
}

export type CollectFeesFromAnyone = {
  $$type: 'CollectFeesFromAnyone'
  queryId: bigint
}

export function storeCollectFeesFromAnyone(src: CollectFeesFromAnyone) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(1178668269, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadCollectFeesFromAnyone(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 1178668269) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'CollectFeesFromAnyone' as const, queryId: _queryId }
}

function loadTupleCollectFeesFromAnyone(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'CollectFeesFromAnyone' as const, queryId: _queryId }
}

function loadGetterTupleCollectFeesFromAnyone(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'CollectFeesFromAnyone' as const, queryId: _queryId }
}

function storeTupleCollectFeesFromAnyone(source: CollectFeesFromAnyone) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserCollectFeesFromAnyone(): DictionaryValue<CollectFeesFromAnyone> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeCollectFeesFromAnyone(src)).endCell())
    },
    parse: (src) => {
      return loadCollectFeesFromAnyone(src.loadRef().beginParse())
    },
  }
}

export type ResetPoolGasFromRouter = {
  $$type: 'ResetPoolGasFromRouter'
  queryId: bigint
}

export function storeResetPoolGasFromRouter(src: ResetPoolGasFromRouter) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(36161256, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadResetPoolGasFromRouter(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 36161256) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'ResetPoolGasFromRouter' as const, queryId: _queryId }
}

function loadTupleResetPoolGasFromRouter(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'ResetPoolGasFromRouter' as const, queryId: _queryId }
}

function loadGetterTupleResetPoolGasFromRouter(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'ResetPoolGasFromRouter' as const, queryId: _queryId }
}

function storeTupleResetPoolGasFromRouter(source: ResetPoolGasFromRouter) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserResetPoolGasFromRouter(): DictionaryValue<ResetPoolGasFromRouter> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeResetPoolGasFromRouter(src)).endCell())
    },
    parse: (src) => {
      return loadResetPoolGasFromRouter(src.loadRef().beginParse())
    },
  }
}

export type CbRefundMe = {
  $$type: 'CbRefundMe'
  queryId: bigint
  amount0: bigint
  amount1: bigint
  userAddress: Address
}

export function storeCbRefundMe(src: CbRefundMe) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3037540932, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeInt(src.amount0, 257)
    b_0.storeInt(src.amount1, 257)
    b_0.storeAddress(src.userAddress)
  }
}

export function loadCbRefundMe(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3037540932) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _amount0 = sc_0.loadIntBig(257)
  let _amount1 = sc_0.loadIntBig(257)
  let _userAddress = sc_0.loadAddress()
  return {
    $$type: 'CbRefundMe' as const,
    queryId: _queryId,
    amount0: _amount0,
    amount1: _amount1,
    userAddress: _userAddress,
  }
}

function loadTupleCbRefundMe(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  let _userAddress = source.readAddress()
  return {
    $$type: 'CbRefundMe' as const,
    queryId: _queryId,
    amount0: _amount0,
    amount1: _amount1,
    userAddress: _userAddress,
  }
}

function loadGetterTupleCbRefundMe(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  let _userAddress = source.readAddress()
  return {
    $$type: 'CbRefundMe' as const,
    queryId: _queryId,
    amount0: _amount0,
    amount1: _amount1,
    userAddress: _userAddress,
  }
}

function storeTupleCbRefundMe(source: CbRefundMe) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.amount0)
  builder.writeNumber(source.amount1)
  builder.writeAddress(source.userAddress)
  return builder.build()
}

function dictValueParserCbRefundMe(): DictionaryValue<CbRefundMe> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeCbRefundMe(src)).endCell())
    },
    parse: (src) => {
      return loadCbRefundMe(src.loadRef().beginParse())
    },
  }
}

export type CbAddLiquidity = {
  $$type: 'CbAddLiquidity'
  queryId: bigint
  amount0: bigint
  amount1: bigint
  userAddress: Address
  minLpOut: bigint
}

export function storeCbAddLiquidity(src: CbAddLiquidity) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(2591419884, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeInt(src.amount0, 257)
    b_0.storeInt(src.amount1, 257)
    b_0.storeAddress(src.userAddress)
    let b_1 = new Builder()
    b_1.storeInt(src.minLpOut, 257)
    b_0.storeRef(b_1.endCell())
  }
}

export function loadCbAddLiquidity(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 2591419884) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _amount0 = sc_0.loadIntBig(257)
  let _amount1 = sc_0.loadIntBig(257)
  let _userAddress = sc_0.loadAddress()
  let sc_1 = sc_0.loadRef().beginParse()
  let _minLpOut = sc_1.loadIntBig(257)
  return {
    $$type: 'CbAddLiquidity' as const,
    queryId: _queryId,
    amount0: _amount0,
    amount1: _amount1,
    userAddress: _userAddress,
    minLpOut: _minLpOut,
  }
}

function loadTupleCbAddLiquidity(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  let _userAddress = source.readAddress()
  let _minLpOut = source.readBigNumber()
  return {
    $$type: 'CbAddLiquidity' as const,
    queryId: _queryId,
    amount0: _amount0,
    amount1: _amount1,
    userAddress: _userAddress,
    minLpOut: _minLpOut,
  }
}

function loadGetterTupleCbAddLiquidity(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  let _userAddress = source.readAddress()
  let _minLpOut = source.readBigNumber()
  return {
    $$type: 'CbAddLiquidity' as const,
    queryId: _queryId,
    amount0: _amount0,
    amount1: _amount1,
    userAddress: _userAddress,
    minLpOut: _minLpOut,
  }
}

function storeTupleCbAddLiquidity(source: CbAddLiquidity) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.amount0)
  builder.writeNumber(source.amount1)
  builder.writeAddress(source.userAddress)
  builder.writeNumber(source.minLpOut)
  return builder.build()
}

function dictValueParserCbAddLiquidity(): DictionaryValue<CbAddLiquidity> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeCbAddLiquidity(src)).endCell())
    },
    parse: (src) => {
      return loadCbAddLiquidity(src.loadRef().beginParse())
    },
  }
}

export type GetterPoolData = {
  $$type: 'GetterPoolData'
  queryId: bigint
}

export function storeGetterPoolData(src: GetterPoolData) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3439172323, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadGetterPoolData(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3439172323) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'GetterPoolData' as const, queryId: _queryId }
}

function loadTupleGetterPoolData(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'GetterPoolData' as const, queryId: _queryId }
}

function loadGetterTupleGetterPoolData(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'GetterPoolData' as const, queryId: _queryId }
}

function storeTupleGetterPoolData(source: GetterPoolData) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserGetterPoolData(): DictionaryValue<GetterPoolData> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeGetterPoolData(src)).endCell())
    },
    parse: (src) => {
      return loadGetterPoolData(src.loadRef().beginParse())
    },
  }
}

export type GetterPoolDataResponse = {
  $$type: 'GetterPoolDataResponse'
  queryId: bigint
  reserve0: bigint
  reserve1: bigint
  token0Address: Address
  token1Address: Address
  lpFee: bigint
  protocolFee: bigint
  refFee: bigint
  protocolFeeAddress: Address | null
  collectedToken0ProtocolFee: bigint
  collectedToken1ProtocolFee: bigint
}

export function storeGetterPoolDataResponse(src: GetterPoolDataResponse) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(224329874, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeInt(src.reserve0, 257)
    b_0.storeInt(src.reserve1, 257)
    b_0.storeAddress(src.token0Address)
    let b_1 = new Builder()
    b_1.storeAddress(src.token1Address)
    b_1.storeUint(src.lpFee, 16)
    b_1.storeUint(src.protocolFee, 16)
    b_1.storeUint(src.refFee, 16)
    b_1.storeAddress(src.protocolFeeAddress)
    b_1.storeInt(src.collectedToken0ProtocolFee, 257)
    let b_2 = new Builder()
    b_2.storeInt(src.collectedToken1ProtocolFee, 257)
    b_1.storeRef(b_2.endCell())
    b_0.storeRef(b_1.endCell())
  }
}

export function loadGetterPoolDataResponse(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 224329874) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _reserve0 = sc_0.loadIntBig(257)
  let _reserve1 = sc_0.loadIntBig(257)
  let _token0Address = sc_0.loadAddress()
  let sc_1 = sc_0.loadRef().beginParse()
  let _token1Address = sc_1.loadAddress()
  let _lpFee = sc_1.loadUintBig(16)
  let _protocolFee = sc_1.loadUintBig(16)
  let _refFee = sc_1.loadUintBig(16)
  let _protocolFeeAddress = sc_1.loadMaybeAddress()
  let _collectedToken0ProtocolFee = sc_1.loadIntBig(257)
  let sc_2 = sc_1.loadRef().beginParse()
  let _collectedToken1ProtocolFee = sc_2.loadIntBig(257)
  return {
    $$type: 'GetterPoolDataResponse' as const,
    queryId: _queryId,
    reserve0: _reserve0,
    reserve1: _reserve1,
    token0Address: _token0Address,
    token1Address: _token1Address,
    lpFee: _lpFee,
    protocolFee: _protocolFee,
    refFee: _refFee,
    protocolFeeAddress: _protocolFeeAddress,
    collectedToken0ProtocolFee: _collectedToken0ProtocolFee,
    collectedToken1ProtocolFee: _collectedToken1ProtocolFee,
  }
}

function loadTupleGetterPoolDataResponse(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _reserve0 = source.readBigNumber()
  let _reserve1 = source.readBigNumber()
  let _token0Address = source.readAddress()
  let _token1Address = source.readAddress()
  let _lpFee = source.readBigNumber()
  let _protocolFee = source.readBigNumber()
  let _refFee = source.readBigNumber()
  let _protocolFeeAddress = source.readAddressOpt()
  let _collectedToken0ProtocolFee = source.readBigNumber()
  let _collectedToken1ProtocolFee = source.readBigNumber()
  return {
    $$type: 'GetterPoolDataResponse' as const,
    queryId: _queryId,
    reserve0: _reserve0,
    reserve1: _reserve1,
    token0Address: _token0Address,
    token1Address: _token1Address,
    lpFee: _lpFee,
    protocolFee: _protocolFee,
    refFee: _refFee,
    protocolFeeAddress: _protocolFeeAddress,
    collectedToken0ProtocolFee: _collectedToken0ProtocolFee,
    collectedToken1ProtocolFee: _collectedToken1ProtocolFee,
  }
}

function loadGetterTupleGetterPoolDataResponse(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _reserve0 = source.readBigNumber()
  let _reserve1 = source.readBigNumber()
  let _token0Address = source.readAddress()
  let _token1Address = source.readAddress()
  let _lpFee = source.readBigNumber()
  let _protocolFee = source.readBigNumber()
  let _refFee = source.readBigNumber()
  let _protocolFeeAddress = source.readAddressOpt()
  let _collectedToken0ProtocolFee = source.readBigNumber()
  let _collectedToken1ProtocolFee = source.readBigNumber()
  return {
    $$type: 'GetterPoolDataResponse' as const,
    queryId: _queryId,
    reserve0: _reserve0,
    reserve1: _reserve1,
    token0Address: _token0Address,
    token1Address: _token1Address,
    lpFee: _lpFee,
    protocolFee: _protocolFee,
    refFee: _refFee,
    protocolFeeAddress: _protocolFeeAddress,
    collectedToken0ProtocolFee: _collectedToken0ProtocolFee,
    collectedToken1ProtocolFee: _collectedToken1ProtocolFee,
  }
}

function storeTupleGetterPoolDataResponse(source: GetterPoolDataResponse) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.reserve0)
  builder.writeNumber(source.reserve1)
  builder.writeAddress(source.token0Address)
  builder.writeAddress(source.token1Address)
  builder.writeNumber(source.lpFee)
  builder.writeNumber(source.protocolFee)
  builder.writeNumber(source.refFee)
  builder.writeAddress(source.protocolFeeAddress)
  builder.writeNumber(source.collectedToken0ProtocolFee)
  builder.writeNumber(source.collectedToken1ProtocolFee)
  return builder.build()
}

function dictValueParserGetterPoolDataResponse(): DictionaryValue<GetterPoolDataResponse> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeGetterPoolDataResponse(src)).endCell())
    },
    parse: (src) => {
      return loadGetterPoolDataResponse(src.loadRef().beginParse())
    },
  }
}

export type GetterExpectedOutputs = {
  $$type: 'GetterExpectedOutputs'
  queryId: bigint
  amount: bigint
  tokenWallet: Address
}

export function storeGetterExpectedOutputs(src: GetterExpectedOutputs) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(798241065, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeInt(src.amount, 257)
    b_0.storeAddress(src.tokenWallet)
  }
}

export function loadGetterExpectedOutputs(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 798241065) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _amount = sc_0.loadIntBig(257)
  let _tokenWallet = sc_0.loadAddress()
  return { $$type: 'GetterExpectedOutputs' as const, queryId: _queryId, amount: _amount, tokenWallet: _tokenWallet }
}

function loadTupleGetterExpectedOutputs(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount = source.readBigNumber()
  let _tokenWallet = source.readAddress()
  return { $$type: 'GetterExpectedOutputs' as const, queryId: _queryId, amount: _amount, tokenWallet: _tokenWallet }
}

function loadGetterTupleGetterExpectedOutputs(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount = source.readBigNumber()
  let _tokenWallet = source.readAddress()
  return { $$type: 'GetterExpectedOutputs' as const, queryId: _queryId, amount: _amount, tokenWallet: _tokenWallet }
}

function storeTupleGetterExpectedOutputs(source: GetterExpectedOutputs) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.amount)
  builder.writeAddress(source.tokenWallet)
  return builder.build()
}

function dictValueParserGetterExpectedOutputs(): DictionaryValue<GetterExpectedOutputs> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeGetterExpectedOutputs(src)).endCell())
    },
    parse: (src) => {
      return loadGetterExpectedOutputs(src.loadRef().beginParse())
    },
  }
}

export type GetterExpectedOutputsResponse = {
  $$type: 'GetterExpectedOutputsResponse'
  queryId: bigint
  amountOut: bigint
  protocolFeeOut: bigint
  refFeeOut: bigint
}

export function storeGetterExpectedOutputsResponse(src: GetterExpectedOutputsResponse) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(1175137944, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeInt(src.amountOut, 257)
    b_0.storeInt(src.protocolFeeOut, 257)
    b_0.storeInt(src.refFeeOut, 257)
  }
}

export function loadGetterExpectedOutputsResponse(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 1175137944) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _amountOut = sc_0.loadIntBig(257)
  let _protocolFeeOut = sc_0.loadIntBig(257)
  let _refFeeOut = sc_0.loadIntBig(257)
  return {
    $$type: 'GetterExpectedOutputsResponse' as const,
    queryId: _queryId,
    amountOut: _amountOut,
    protocolFeeOut: _protocolFeeOut,
    refFeeOut: _refFeeOut,
  }
}

function loadTupleGetterExpectedOutputsResponse(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amountOut = source.readBigNumber()
  let _protocolFeeOut = source.readBigNumber()
  let _refFeeOut = source.readBigNumber()
  return {
    $$type: 'GetterExpectedOutputsResponse' as const,
    queryId: _queryId,
    amountOut: _amountOut,
    protocolFeeOut: _protocolFeeOut,
    refFeeOut: _refFeeOut,
  }
}

function loadGetterTupleGetterExpectedOutputsResponse(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amountOut = source.readBigNumber()
  let _protocolFeeOut = source.readBigNumber()
  let _refFeeOut = source.readBigNumber()
  return {
    $$type: 'GetterExpectedOutputsResponse' as const,
    queryId: _queryId,
    amountOut: _amountOut,
    protocolFeeOut: _protocolFeeOut,
    refFeeOut: _refFeeOut,
  }
}

function storeTupleGetterExpectedOutputsResponse(source: GetterExpectedOutputsResponse) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.amountOut)
  builder.writeNumber(source.protocolFeeOut)
  builder.writeNumber(source.refFeeOut)
  return builder.build()
}

function dictValueParserGetterExpectedOutputsResponse(): DictionaryValue<GetterExpectedOutputsResponse> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeGetterExpectedOutputsResponse(src)).endCell())
    },
    parse: (src) => {
      return loadGetterExpectedOutputsResponse(src.loadRef().beginParse())
    },
  }
}

export type GetterLpAccountAddress = {
  $$type: 'GetterLpAccountAddress'
  queryId: bigint
  userAddress: Address
}

export function storeGetterLpAccountAddress(src: GetterLpAccountAddress) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(2293751985, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.userAddress)
  }
}

export function loadGetterLpAccountAddress(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 2293751985) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _userAddress = sc_0.loadAddress()
  return { $$type: 'GetterLpAccountAddress' as const, queryId: _queryId, userAddress: _userAddress }
}

function loadTupleGetterLpAccountAddress(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _userAddress = source.readAddress()
  return { $$type: 'GetterLpAccountAddress' as const, queryId: _queryId, userAddress: _userAddress }
}

function loadGetterTupleGetterLpAccountAddress(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _userAddress = source.readAddress()
  return { $$type: 'GetterLpAccountAddress' as const, queryId: _queryId, userAddress: _userAddress }
}

function storeTupleGetterLpAccountAddress(source: GetterLpAccountAddress) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.userAddress)
  return builder.build()
}

function dictValueParserGetterLpAccountAddress(): DictionaryValue<GetterLpAccountAddress> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeGetterLpAccountAddress(src)).endCell())
    },
    parse: (src) => {
      return loadGetterLpAccountAddress(src.loadRef().beginParse())
    },
  }
}

export type GetterLpAccountAddressResponse = {
  $$type: 'GetterLpAccountAddressResponse'
  queryId: bigint
  accountAddress: Address
}

export function storeGetterLpAccountAddressResponse(src: GetterLpAccountAddressResponse) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3401295102, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.accountAddress)
  }
}

export function loadGetterLpAccountAddressResponse(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3401295102) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _accountAddress = sc_0.loadAddress()
  return { $$type: 'GetterLpAccountAddressResponse' as const, queryId: _queryId, accountAddress: _accountAddress }
}

function loadTupleGetterLpAccountAddressResponse(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _accountAddress = source.readAddress()
  return { $$type: 'GetterLpAccountAddressResponse' as const, queryId: _queryId, accountAddress: _accountAddress }
}

function loadGetterTupleGetterLpAccountAddressResponse(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _accountAddress = source.readAddress()
  return { $$type: 'GetterLpAccountAddressResponse' as const, queryId: _queryId, accountAddress: _accountAddress }
}

function storeTupleGetterLpAccountAddressResponse(source: GetterLpAccountAddressResponse) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.accountAddress)
  return builder.build()
}

function dictValueParserGetterLpAccountAddressResponse(): DictionaryValue<GetterLpAccountAddressResponse> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeGetterLpAccountAddressResponse(src)).endCell())
    },
    parse: (src) => {
      return loadGetterLpAccountAddressResponse(src.loadRef().beginParse())
    },
  }
}

export type GetterExpectedTokens = {
  $$type: 'GetterExpectedTokens'
  queryId: bigint
  amount0: bigint
  amount1: bigint
}

export function storeGetterExpectedTokens(src: GetterExpectedTokens) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3552613028, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeInt(src.amount0, 257)
    b_0.storeInt(src.amount1, 257)
  }
}

export function loadGetterExpectedTokens(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3552613028) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _amount0 = sc_0.loadIntBig(257)
  let _amount1 = sc_0.loadIntBig(257)
  return { $$type: 'GetterExpectedTokens' as const, queryId: _queryId, amount0: _amount0, amount1: _amount1 }
}

function loadTupleGetterExpectedTokens(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  return { $$type: 'GetterExpectedTokens' as const, queryId: _queryId, amount0: _amount0, amount1: _amount1 }
}

function loadGetterTupleGetterExpectedTokens(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  return { $$type: 'GetterExpectedTokens' as const, queryId: _queryId, amount0: _amount0, amount1: _amount1 }
}

function storeTupleGetterExpectedTokens(source: GetterExpectedTokens) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.amount0)
  builder.writeNumber(source.amount1)
  return builder.build()
}

function dictValueParserGetterExpectedTokens(): DictionaryValue<GetterExpectedTokens> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeGetterExpectedTokens(src)).endCell())
    },
    parse: (src) => {
      return loadGetterExpectedTokens(src.loadRef().beginParse())
    },
  }
}

export type GetterExpectedTokensResponse = {
  $$type: 'GetterExpectedTokensResponse'
  queryId: bigint
  liquidity: bigint
}

export function storeGetterExpectedTokensResponse(src: GetterExpectedTokensResponse) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(608234390, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeInt(src.liquidity, 257)
  }
}

export function loadGetterExpectedTokensResponse(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 608234390) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _liquidity = sc_0.loadIntBig(257)
  return { $$type: 'GetterExpectedTokensResponse' as const, queryId: _queryId, liquidity: _liquidity }
}

function loadTupleGetterExpectedTokensResponse(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _liquidity = source.readBigNumber()
  return { $$type: 'GetterExpectedTokensResponse' as const, queryId: _queryId, liquidity: _liquidity }
}

function loadGetterTupleGetterExpectedTokensResponse(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _liquidity = source.readBigNumber()
  return { $$type: 'GetterExpectedTokensResponse' as const, queryId: _queryId, liquidity: _liquidity }
}

function storeTupleGetterExpectedTokensResponse(source: GetterExpectedTokensResponse) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.liquidity)
  return builder.build()
}

function dictValueParserGetterExpectedTokensResponse(): DictionaryValue<GetterExpectedTokensResponse> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeGetterExpectedTokensResponse(src)).endCell())
    },
    parse: (src) => {
      return loadGetterExpectedTokensResponse(src.loadRef().beginParse())
    },
  }
}

export type GetterExpectedLiquidity = {
  $$type: 'GetterExpectedLiquidity'
  queryId: bigint
  liquidity: bigint
}

export function storeGetterExpectedLiquidity(src: GetterExpectedLiquidity) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(900989916, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeInt(src.liquidity, 257)
  }
}

export function loadGetterExpectedLiquidity(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 900989916) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _liquidity = sc_0.loadIntBig(257)
  return { $$type: 'GetterExpectedLiquidity' as const, queryId: _queryId, liquidity: _liquidity }
}

function loadTupleGetterExpectedLiquidity(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _liquidity = source.readBigNumber()
  return { $$type: 'GetterExpectedLiquidity' as const, queryId: _queryId, liquidity: _liquidity }
}

function loadGetterTupleGetterExpectedLiquidity(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _liquidity = source.readBigNumber()
  return { $$type: 'GetterExpectedLiquidity' as const, queryId: _queryId, liquidity: _liquidity }
}

function storeTupleGetterExpectedLiquidity(source: GetterExpectedLiquidity) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.liquidity)
  return builder.build()
}

function dictValueParserGetterExpectedLiquidity(): DictionaryValue<GetterExpectedLiquidity> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeGetterExpectedLiquidity(src)).endCell())
    },
    parse: (src) => {
      return loadGetterExpectedLiquidity(src.loadRef().beginParse())
    },
  }
}

export type GetterExpectedLiquidityResponse = {
  $$type: 'GetterExpectedLiquidityResponse'
  queryId: bigint
  amount0: bigint
  amount1: bigint
}

export function storeGetterExpectedLiquidityResponse(src: GetterExpectedLiquidityResponse) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(876627575, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeInt(src.amount0, 257)
    b_0.storeInt(src.amount1, 257)
  }
}

export function loadGetterExpectedLiquidityResponse(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 876627575) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _amount0 = sc_0.loadIntBig(257)
  let _amount1 = sc_0.loadIntBig(257)
  return { $$type: 'GetterExpectedLiquidityResponse' as const, queryId: _queryId, amount0: _amount0, amount1: _amount1 }
}

function loadTupleGetterExpectedLiquidityResponse(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  return { $$type: 'GetterExpectedLiquidityResponse' as const, queryId: _queryId, amount0: _amount0, amount1: _amount1 }
}

function loadGetterTupleGetterExpectedLiquidityResponse(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  return { $$type: 'GetterExpectedLiquidityResponse' as const, queryId: _queryId, amount0: _amount0, amount1: _amount1 }
}

function storeTupleGetterExpectedLiquidityResponse(source: GetterExpectedLiquidityResponse) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.amount0)
  builder.writeNumber(source.amount1)
  return builder.build()
}

function dictValueParserGetterExpectedLiquidityResponse(): DictionaryValue<GetterExpectedLiquidityResponse> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeGetterExpectedLiquidityResponse(src)).endCell())
    },
    parse: (src) => {
      return loadGetterExpectedLiquidityResponse(src.loadRef().beginParse())
    },
  }
}

export type ProvideWalletAddress = {
  $$type: 'ProvideWalletAddress'
  queryId: bigint
  owner: Address
}

export function storeProvideWalletAddress(src: ProvideWalletAddress) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(1284018228, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.owner)
  }
}

export function loadProvideWalletAddress(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 1284018228) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _owner = sc_0.loadAddress()
  return { $$type: 'ProvideWalletAddress' as const, queryId: _queryId, owner: _owner }
}

function loadTupleProvideWalletAddress(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _owner = source.readAddress()
  return { $$type: 'ProvideWalletAddress' as const, queryId: _queryId, owner: _owner }
}

function loadGetterTupleProvideWalletAddress(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _owner = source.readAddress()
  return { $$type: 'ProvideWalletAddress' as const, queryId: _queryId, owner: _owner }
}

function storeTupleProvideWalletAddress(source: ProvideWalletAddress) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.owner)
  return builder.build()
}

function dictValueParserProvideWalletAddress(): DictionaryValue<ProvideWalletAddress> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeProvideWalletAddress(src)).endCell())
    },
    parse: (src) => {
      return loadProvideWalletAddress(src.loadRef().beginParse())
    },
  }
}

export type ProvideWalletAddressResponse = {
  $$type: 'ProvideWalletAddressResponse'
  queryId: bigint
  wallet: Address
}

export function storeProvideWalletAddressResponse(src: ProvideWalletAddressResponse) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(555518088, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.wallet)
  }
}

export function loadProvideWalletAddressResponse(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 555518088) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _wallet = sc_0.loadAddress()
  return { $$type: 'ProvideWalletAddressResponse' as const, queryId: _queryId, wallet: _wallet }
}

function loadTupleProvideWalletAddressResponse(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _wallet = source.readAddress()
  return { $$type: 'ProvideWalletAddressResponse' as const, queryId: _queryId, wallet: _wallet }
}

function loadGetterTupleProvideWalletAddressResponse(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _wallet = source.readAddress()
  return { $$type: 'ProvideWalletAddressResponse' as const, queryId: _queryId, wallet: _wallet }
}

function storeTupleProvideWalletAddressResponse(source: ProvideWalletAddressResponse) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.wallet)
  return builder.build()
}

function dictValueParserProvideWalletAddressResponse(): DictionaryValue<ProvideWalletAddressResponse> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeProvideWalletAddressResponse(src)).endCell())
    },
    parse: (src) => {
      return loadProvideWalletAddressResponse(src.loadRef().beginParse())
    },
  }
}

export type JettonWalletData = {
  $$type: 'JettonWalletData'
  balance: bigint
  owner: Address
  master: Address
  code: Cell
}

export function storeJettonWalletData(src: JettonWalletData) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeInt(src.balance, 257)
    b_0.storeAddress(src.owner)
    b_0.storeAddress(src.master)
    b_0.storeRef(src.code)
  }
}

export function loadJettonWalletData(slice: Slice) {
  let sc_0 = slice
  let _balance = sc_0.loadIntBig(257)
  let _owner = sc_0.loadAddress()
  let _master = sc_0.loadAddress()
  let _code = sc_0.loadRef()
  return { $$type: 'JettonWalletData' as const, balance: _balance, owner: _owner, master: _master, code: _code }
}

function loadTupleJettonWalletData(source: TupleReader) {
  let _balance = source.readBigNumber()
  let _owner = source.readAddress()
  let _master = source.readAddress()
  let _code = source.readCell()
  return { $$type: 'JettonWalletData' as const, balance: _balance, owner: _owner, master: _master, code: _code }
}

function loadGetterTupleJettonWalletData(source: TupleReader) {
  let _balance = source.readBigNumber()
  let _owner = source.readAddress()
  let _master = source.readAddress()
  let _code = source.readCell()
  return { $$type: 'JettonWalletData' as const, balance: _balance, owner: _owner, master: _master, code: _code }
}

function storeTupleJettonWalletData(source: JettonWalletData) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.balance)
  builder.writeAddress(source.owner)
  builder.writeAddress(source.master)
  builder.writeCell(source.code)
  return builder.build()
}

function dictValueParserJettonWalletData(): DictionaryValue<JettonWalletData> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeJettonWalletData(src)).endCell())
    },
    parse: (src) => {
      return loadJettonWalletData(src.loadRef().beginParse())
    },
  }
}

export type TokenTransfer = {
  $$type: 'TokenTransfer'
  queryId: bigint
  amount: bigint
  destination: Address
  responseDestination: Address | null
  customPayload: Cell | null
  forwardTonAmount: bigint
  forwardPayload: Cell | null
}

export function storeTokenTransfer(src: TokenTransfer) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(260734629, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeCoins(src.amount)
    b_0.storeAddress(src.destination)
    b_0.storeAddress(src.responseDestination)
    if (src.customPayload !== null && src.customPayload !== undefined) {
      b_0.storeBit(true).storeRef(src.customPayload)
    } else {
      b_0.storeBit(false)
    }
    b_0.storeCoins(src.forwardTonAmount)
    if (src.forwardPayload !== null && src.forwardPayload !== undefined) {
      b_0.storeBit(true).storeRef(src.forwardPayload)
    } else {
      b_0.storeBit(false)
    }
  }
}

export function loadTokenTransfer(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 260734629) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _amount = sc_0.loadCoins()
  let _destination = sc_0.loadAddress()
  let _responseDestination = sc_0.loadMaybeAddress()
  let _customPayload = sc_0.loadBit() ? sc_0.loadRef() : null
  let _forwardTonAmount = sc_0.loadCoins()
  let _forwardPayload = sc_0.loadBit() ? sc_0.loadRef() : null
  return {
    $$type: 'TokenTransfer' as const,
    queryId: _queryId,
    amount: _amount,
    destination: _destination,
    responseDestination: _responseDestination,
    customPayload: _customPayload,
    forwardTonAmount: _forwardTonAmount,
    forwardPayload: _forwardPayload,
  }
}

function loadTupleTokenTransfer(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount = source.readBigNumber()
  let _destination = source.readAddress()
  let _responseDestination = source.readAddressOpt()
  let _customPayload = source.readCellOpt()
  let _forwardTonAmount = source.readBigNumber()
  let _forwardPayload = source.readCellOpt()
  return {
    $$type: 'TokenTransfer' as const,
    queryId: _queryId,
    amount: _amount,
    destination: _destination,
    responseDestination: _responseDestination,
    customPayload: _customPayload,
    forwardTonAmount: _forwardTonAmount,
    forwardPayload: _forwardPayload,
  }
}

function loadGetterTupleTokenTransfer(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount = source.readBigNumber()
  let _destination = source.readAddress()
  let _responseDestination = source.readAddressOpt()
  let _customPayload = source.readCellOpt()
  let _forwardTonAmount = source.readBigNumber()
  let _forwardPayload = source.readCellOpt()
  return {
    $$type: 'TokenTransfer' as const,
    queryId: _queryId,
    amount: _amount,
    destination: _destination,
    responseDestination: _responseDestination,
    customPayload: _customPayload,
    forwardTonAmount: _forwardTonAmount,
    forwardPayload: _forwardPayload,
  }
}

function storeTupleTokenTransfer(source: TokenTransfer) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.amount)
  builder.writeAddress(source.destination)
  builder.writeAddress(source.responseDestination)
  builder.writeCell(source.customPayload)
  builder.writeNumber(source.forwardTonAmount)
  builder.writeCell(source.forwardPayload)
  return builder.build()
}

function dictValueParserTokenTransfer(): DictionaryValue<TokenTransfer> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeTokenTransfer(src)).endCell())
    },
    parse: (src) => {
      return loadTokenTransfer(src.loadRef().beginParse())
    },
  }
}

export type TokenTransferInternal = {
  $$type: 'TokenTransferInternal'
  queryId: bigint
  amount: bigint
  from: Address
  responseDestination: Address | null
  forwardTonAmount: bigint
  forwardPayload: Cell | null
}

export function storeTokenTransferInternal(src: TokenTransferInternal) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(395134233, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeCoins(src.amount)
    b_0.storeAddress(src.from)
    b_0.storeAddress(src.responseDestination)
    b_0.storeCoins(src.forwardTonAmount)
    if (src.forwardPayload !== null && src.forwardPayload !== undefined) {
      b_0.storeBit(true).storeRef(src.forwardPayload)
    } else {
      b_0.storeBit(false)
    }
  }
}

export function loadTokenTransferInternal(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 395134233) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _amount = sc_0.loadCoins()
  let _from = sc_0.loadAddress()
  let _responseDestination = sc_0.loadMaybeAddress()
  let _forwardTonAmount = sc_0.loadCoins()
  let _forwardPayload = sc_0.loadBit() ? sc_0.loadRef() : null
  return {
    $$type: 'TokenTransferInternal' as const,
    queryId: _queryId,
    amount: _amount,
    from: _from,
    responseDestination: _responseDestination,
    forwardTonAmount: _forwardTonAmount,
    forwardPayload: _forwardPayload,
  }
}

function loadTupleTokenTransferInternal(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount = source.readBigNumber()
  let _from = source.readAddress()
  let _responseDestination = source.readAddressOpt()
  let _forwardTonAmount = source.readBigNumber()
  let _forwardPayload = source.readCellOpt()
  return {
    $$type: 'TokenTransferInternal' as const,
    queryId: _queryId,
    amount: _amount,
    from: _from,
    responseDestination: _responseDestination,
    forwardTonAmount: _forwardTonAmount,
    forwardPayload: _forwardPayload,
  }
}

function loadGetterTupleTokenTransferInternal(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount = source.readBigNumber()
  let _from = source.readAddress()
  let _responseDestination = source.readAddressOpt()
  let _forwardTonAmount = source.readBigNumber()
  let _forwardPayload = source.readCellOpt()
  return {
    $$type: 'TokenTransferInternal' as const,
    queryId: _queryId,
    amount: _amount,
    from: _from,
    responseDestination: _responseDestination,
    forwardTonAmount: _forwardTonAmount,
    forwardPayload: _forwardPayload,
  }
}

function storeTupleTokenTransferInternal(source: TokenTransferInternal) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.amount)
  builder.writeAddress(source.from)
  builder.writeAddress(source.responseDestination)
  builder.writeNumber(source.forwardTonAmount)
  builder.writeCell(source.forwardPayload)
  return builder.build()
}

function dictValueParserTokenTransferInternal(): DictionaryValue<TokenTransferInternal> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeTokenTransferInternal(src)).endCell())
    },
    parse: (src) => {
      return loadTokenTransferInternal(src.loadRef().beginParse())
    },
  }
}

export type TokenNotification = {
  $$type: 'TokenNotification'
  queryId: bigint
  amount: bigint
  from: Address
  forwardPayload: Cell | null
}

export function storeTokenNotification(src: TokenNotification) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(1935855772, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeCoins(src.amount)
    b_0.storeAddress(src.from)
    if (src.forwardPayload !== null && src.forwardPayload !== undefined) {
      b_0.storeBit(true).storeRef(src.forwardPayload)
    } else {
      b_0.storeBit(false)
    }
  }
}

export function loadTokenNotification(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 1935855772) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _amount = sc_0.loadCoins()
  let _from = sc_0.loadAddress()
  let _forwardPayload = sc_0.loadBit() ? sc_0.loadRef() : null
  return {
    $$type: 'TokenNotification' as const,
    queryId: _queryId,
    amount: _amount,
    from: _from,
    forwardPayload: _forwardPayload,
  }
}

function loadTupleTokenNotification(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount = source.readBigNumber()
  let _from = source.readAddress()
  let _forwardPayload = source.readCellOpt()
  return {
    $$type: 'TokenNotification' as const,
    queryId: _queryId,
    amount: _amount,
    from: _from,
    forwardPayload: _forwardPayload,
  }
}

function loadGetterTupleTokenNotification(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount = source.readBigNumber()
  let _from = source.readAddress()
  let _forwardPayload = source.readCellOpt()
  return {
    $$type: 'TokenNotification' as const,
    queryId: _queryId,
    amount: _amount,
    from: _from,
    forwardPayload: _forwardPayload,
  }
}

function storeTupleTokenNotification(source: TokenNotification) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.amount)
  builder.writeAddress(source.from)
  builder.writeCell(source.forwardPayload)
  return builder.build()
}

function dictValueParserTokenNotification(): DictionaryValue<TokenNotification> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeTokenNotification(src)).endCell())
    },
    parse: (src) => {
      return loadTokenNotification(src.loadRef().beginParse())
    },
  }
}

export type TokenBurn = {
  $$type: 'TokenBurn'
  queryId: bigint
  amount: bigint
  responseDestination: Address | null
  customPayload: Cell | null
}

export function storeTokenBurn(src: TokenBurn) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(1499400124, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeCoins(src.amount)
    b_0.storeAddress(src.responseDestination)
    if (src.customPayload !== null && src.customPayload !== undefined) {
      b_0.storeBit(true).storeRef(src.customPayload)
    } else {
      b_0.storeBit(false)
    }
  }
}

export function loadTokenBurn(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 1499400124) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _amount = sc_0.loadCoins()
  let _responseDestination = sc_0.loadMaybeAddress()
  let _customPayload = sc_0.loadBit() ? sc_0.loadRef() : null
  return {
    $$type: 'TokenBurn' as const,
    queryId: _queryId,
    amount: _amount,
    responseDestination: _responseDestination,
    customPayload: _customPayload,
  }
}

function loadTupleTokenBurn(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount = source.readBigNumber()
  let _responseDestination = source.readAddressOpt()
  let _customPayload = source.readCellOpt()
  return {
    $$type: 'TokenBurn' as const,
    queryId: _queryId,
    amount: _amount,
    responseDestination: _responseDestination,
    customPayload: _customPayload,
  }
}

function loadGetterTupleTokenBurn(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount = source.readBigNumber()
  let _responseDestination = source.readAddressOpt()
  let _customPayload = source.readCellOpt()
  return {
    $$type: 'TokenBurn' as const,
    queryId: _queryId,
    amount: _amount,
    responseDestination: _responseDestination,
    customPayload: _customPayload,
  }
}

function storeTupleTokenBurn(source: TokenBurn) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.amount)
  builder.writeAddress(source.responseDestination)
  builder.writeCell(source.customPayload)
  return builder.build()
}

function dictValueParserTokenBurn(): DictionaryValue<TokenBurn> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeTokenBurn(src)).endCell())
    },
    parse: (src) => {
      return loadTokenBurn(src.loadRef().beginParse())
    },
  }
}

export type TokenBurnNotification = {
  $$type: 'TokenBurnNotification'
  queryId: bigint
  amount: bigint
  sender: Address
  responseDestination: Address | null
  token0MinOut: bigint
  token1MinOut: bigint
}

export function storeTokenBurnNotification(src: TokenBurnNotification) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(2078119902, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeCoins(src.amount)
    b_0.storeAddress(src.sender)
    b_0.storeAddress(src.responseDestination)
    b_0.storeCoins(src.token0MinOut)
    b_0.storeCoins(src.token1MinOut)
  }
}

export function loadTokenBurnNotification(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 2078119902) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _amount = sc_0.loadCoins()
  let _sender = sc_0.loadAddress()
  let _responseDestination = sc_0.loadMaybeAddress()
  let _token0MinOut = sc_0.loadCoins()
  let _token1MinOut = sc_0.loadCoins()
  return {
    $$type: 'TokenBurnNotification' as const,
    queryId: _queryId,
    amount: _amount,
    sender: _sender,
    responseDestination: _responseDestination,
    token0MinOut: _token0MinOut,
    token1MinOut: _token1MinOut,
  }
}

function loadTupleTokenBurnNotification(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount = source.readBigNumber()
  let _sender = source.readAddress()
  let _responseDestination = source.readAddressOpt()
  let _token0MinOut = source.readBigNumber()
  let _token1MinOut = source.readBigNumber()
  return {
    $$type: 'TokenBurnNotification' as const,
    queryId: _queryId,
    amount: _amount,
    sender: _sender,
    responseDestination: _responseDestination,
    token0MinOut: _token0MinOut,
    token1MinOut: _token1MinOut,
  }
}

function loadGetterTupleTokenBurnNotification(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount = source.readBigNumber()
  let _sender = source.readAddress()
  let _responseDestination = source.readAddressOpt()
  let _token0MinOut = source.readBigNumber()
  let _token1MinOut = source.readBigNumber()
  return {
    $$type: 'TokenBurnNotification' as const,
    queryId: _queryId,
    amount: _amount,
    sender: _sender,
    responseDestination: _responseDestination,
    token0MinOut: _token0MinOut,
    token1MinOut: _token1MinOut,
  }
}

function storeTupleTokenBurnNotification(source: TokenBurnNotification) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.amount)
  builder.writeAddress(source.sender)
  builder.writeAddress(source.responseDestination)
  builder.writeNumber(source.token0MinOut)
  builder.writeNumber(source.token1MinOut)
  return builder.build()
}

function dictValueParserTokenBurnNotification(): DictionaryValue<TokenBurnNotification> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeTokenBurnNotification(src)).endCell())
    },
    parse: (src) => {
      return loadTokenBurnNotification(src.loadRef().beginParse())
    },
  }
}

export type TokenExcesses = {
  $$type: 'TokenExcesses'
  queryId: bigint
}

export function storeTokenExcesses(src: TokenExcesses) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3576854235, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadTokenExcesses(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3576854235) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'TokenExcesses' as const, queryId: _queryId }
}

function loadTupleTokenExcesses(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'TokenExcesses' as const, queryId: _queryId }
}

function loadGetterTupleTokenExcesses(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'TokenExcesses' as const, queryId: _queryId }
}

function storeTupleTokenExcesses(source: TokenExcesses) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserTokenExcesses(): DictionaryValue<TokenExcesses> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeTokenExcesses(src)).endCell())
    },
    parse: (src) => {
      return loadTokenExcesses(src.loadRef().beginParse())
    },
  }
}

export type TokenUpdateContent = {
  $$type: 'TokenUpdateContent'
  content: Cell
}

export function storeTokenUpdateContent(src: TokenUpdateContent) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(2937889386, 32)
    b_0.storeRef(src.content)
  }
}

export function loadTokenUpdateContent(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 2937889386) {
    throw Error('Invalid prefix')
  }
  let _content = sc_0.loadRef()
  return { $$type: 'TokenUpdateContent' as const, content: _content }
}

function loadTupleTokenUpdateContent(source: TupleReader) {
  let _content = source.readCell()
  return { $$type: 'TokenUpdateContent' as const, content: _content }
}

function loadGetterTupleTokenUpdateContent(source: TupleReader) {
  let _content = source.readCell()
  return { $$type: 'TokenUpdateContent' as const, content: _content }
}

function storeTupleTokenUpdateContent(source: TokenUpdateContent) {
  let builder = new TupleBuilder()
  builder.writeCell(source.content)
  return builder.build()
}

function dictValueParserTokenUpdateContent(): DictionaryValue<TokenUpdateContent> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeTokenUpdateContent(src)).endCell())
    },
    parse: (src) => {
      return loadTokenUpdateContent(src.loadRef().beginParse())
    },
  }
}

export type TakeWalletAddress = {
  $$type: 'TakeWalletAddress'
  queryId: bigint
  walletAddress: Address
  ownerAddress: Slice
}

export function storeTakeWalletAddress(src: TakeWalletAddress) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3513996288, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.walletAddress)
    b_0.storeBuilder(src.ownerAddress.asBuilder())
  }
}

export function loadTakeWalletAddress(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3513996288) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _walletAddress = sc_0.loadAddress()
  let _ownerAddress = sc_0
  return {
    $$type: 'TakeWalletAddress' as const,
    queryId: _queryId,
    walletAddress: _walletAddress,
    ownerAddress: _ownerAddress,
  }
}

function loadTupleTakeWalletAddress(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _walletAddress = source.readAddress()
  let _ownerAddress = source.readCell().asSlice()
  return {
    $$type: 'TakeWalletAddress' as const,
    queryId: _queryId,
    walletAddress: _walletAddress,
    ownerAddress: _ownerAddress,
  }
}

function loadGetterTupleTakeWalletAddress(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _walletAddress = source.readAddress()
  let _ownerAddress = source.readCell().asSlice()
  return {
    $$type: 'TakeWalletAddress' as const,
    queryId: _queryId,
    walletAddress: _walletAddress,
    ownerAddress: _ownerAddress,
  }
}

function storeTupleTakeWalletAddress(source: TakeWalletAddress) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.walletAddress)
  builder.writeSlice(source.ownerAddress.asCell())
  return builder.build()
}

function dictValueParserTakeWalletAddress(): DictionaryValue<TakeWalletAddress> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeTakeWalletAddress(src)).endCell())
    },
    parse: (src) => {
      return loadTakeWalletAddress(src.loadRef().beginParse())
    },
  }
}

export type Pool$Data = {
  $$type: 'Pool$Data'
  router: Address
  token0Address: Address
  token1Address: Address
  totalSupply: bigint
  reserve0: bigint
  reserve1: bigint
  lpFee: bigint
  protocolFee: bigint
  refFee: bigint
  collectedToken0ProtocolFee: bigint
  collectedToken1ProtocolFee: bigint
  protocolFeeAddress: Address | null
}

export function storePool$Data(src: Pool$Data) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeAddress(src.router)
    b_0.storeAddress(src.token0Address)
    b_0.storeAddress(src.token1Address)
    b_0.storeCoins(src.totalSupply)
    let b_1 = new Builder()
    b_1.storeCoins(src.reserve0)
    b_1.storeCoins(src.reserve1)
    b_1.storeUint(src.lpFee, 16)
    b_1.storeUint(src.protocolFee, 16)
    b_1.storeUint(src.refFee, 16)
    b_1.storeCoins(src.collectedToken0ProtocolFee)
    b_1.storeCoins(src.collectedToken1ProtocolFee)
    b_1.storeAddress(src.protocolFeeAddress)
    b_0.storeRef(b_1.endCell())
  }
}

export function loadPool$Data(slice: Slice) {
  let sc_0 = slice
  let _router = sc_0.loadAddress()
  let _token0Address = sc_0.loadAddress()
  let _token1Address = sc_0.loadAddress()
  let _totalSupply = sc_0.loadCoins()
  let sc_1 = sc_0.loadRef().beginParse()
  let _reserve0 = sc_1.loadCoins()
  let _reserve1 = sc_1.loadCoins()
  let _lpFee = sc_1.loadUintBig(16)
  let _protocolFee = sc_1.loadUintBig(16)
  let _refFee = sc_1.loadUintBig(16)
  let _collectedToken0ProtocolFee = sc_1.loadCoins()
  let _collectedToken1ProtocolFee = sc_1.loadCoins()
  let _protocolFeeAddress = sc_1.loadMaybeAddress()
  return {
    $$type: 'Pool$Data' as const,
    router: _router,
    token0Address: _token0Address,
    token1Address: _token1Address,
    totalSupply: _totalSupply,
    reserve0: _reserve0,
    reserve1: _reserve1,
    lpFee: _lpFee,
    protocolFee: _protocolFee,
    refFee: _refFee,
    collectedToken0ProtocolFee: _collectedToken0ProtocolFee,
    collectedToken1ProtocolFee: _collectedToken1ProtocolFee,
    protocolFeeAddress: _protocolFeeAddress,
  }
}

function loadTuplePool$Data(source: TupleReader) {
  let _router = source.readAddress()
  let _token0Address = source.readAddress()
  let _token1Address = source.readAddress()
  let _totalSupply = source.readBigNumber()
  let _reserve0 = source.readBigNumber()
  let _reserve1 = source.readBigNumber()
  let _lpFee = source.readBigNumber()
  let _protocolFee = source.readBigNumber()
  let _refFee = source.readBigNumber()
  let _collectedToken0ProtocolFee = source.readBigNumber()
  let _collectedToken1ProtocolFee = source.readBigNumber()
  let _protocolFeeAddress = source.readAddressOpt()
  return {
    $$type: 'Pool$Data' as const,
    router: _router,
    token0Address: _token0Address,
    token1Address: _token1Address,
    totalSupply: _totalSupply,
    reserve0: _reserve0,
    reserve1: _reserve1,
    lpFee: _lpFee,
    protocolFee: _protocolFee,
    refFee: _refFee,
    collectedToken0ProtocolFee: _collectedToken0ProtocolFee,
    collectedToken1ProtocolFee: _collectedToken1ProtocolFee,
    protocolFeeAddress: _protocolFeeAddress,
  }
}

function loadGetterTuplePool$Data(source: TupleReader) {
  let _router = source.readAddress()
  let _token0Address = source.readAddress()
  let _token1Address = source.readAddress()
  let _totalSupply = source.readBigNumber()
  let _reserve0 = source.readBigNumber()
  let _reserve1 = source.readBigNumber()
  let _lpFee = source.readBigNumber()
  let _protocolFee = source.readBigNumber()
  let _refFee = source.readBigNumber()
  let _collectedToken0ProtocolFee = source.readBigNumber()
  let _collectedToken1ProtocolFee = source.readBigNumber()
  let _protocolFeeAddress = source.readAddressOpt()
  return {
    $$type: 'Pool$Data' as const,
    router: _router,
    token0Address: _token0Address,
    token1Address: _token1Address,
    totalSupply: _totalSupply,
    reserve0: _reserve0,
    reserve1: _reserve1,
    lpFee: _lpFee,
    protocolFee: _protocolFee,
    refFee: _refFee,
    collectedToken0ProtocolFee: _collectedToken0ProtocolFee,
    collectedToken1ProtocolFee: _collectedToken1ProtocolFee,
    protocolFeeAddress: _protocolFeeAddress,
  }
}

function storeTuplePool$Data(source: Pool$Data) {
  let builder = new TupleBuilder()
  builder.writeAddress(source.router)
  builder.writeAddress(source.token0Address)
  builder.writeAddress(source.token1Address)
  builder.writeNumber(source.totalSupply)
  builder.writeNumber(source.reserve0)
  builder.writeNumber(source.reserve1)
  builder.writeNumber(source.lpFee)
  builder.writeNumber(source.protocolFee)
  builder.writeNumber(source.refFee)
  builder.writeNumber(source.collectedToken0ProtocolFee)
  builder.writeNumber(source.collectedToken1ProtocolFee)
  builder.writeAddress(source.protocolFeeAddress)
  return builder.build()
}

function dictValueParserPool$Data(): DictionaryValue<Pool$Data> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storePool$Data(src)).endCell())
    },
    parse: (src) => {
      return loadPool$Data(src.loadRef().beginParse())
    },
  }
}

export type AmountOut = {
  $$type: 'AmountOut'
  swapOut: bigint
  protocolFeeOut: bigint
  refFeeOut: bigint
}

export function storeAmountOut(src: AmountOut) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeInt(src.swapOut, 257)
    b_0.storeInt(src.protocolFeeOut, 257)
    b_0.storeInt(src.refFeeOut, 257)
  }
}

export function loadAmountOut(slice: Slice) {
  let sc_0 = slice
  let _swapOut = sc_0.loadIntBig(257)
  let _protocolFeeOut = sc_0.loadIntBig(257)
  let _refFeeOut = sc_0.loadIntBig(257)
  return { $$type: 'AmountOut' as const, swapOut: _swapOut, protocolFeeOut: _protocolFeeOut, refFeeOut: _refFeeOut }
}

function loadTupleAmountOut(source: TupleReader) {
  let _swapOut = source.readBigNumber()
  let _protocolFeeOut = source.readBigNumber()
  let _refFeeOut = source.readBigNumber()
  return { $$type: 'AmountOut' as const, swapOut: _swapOut, protocolFeeOut: _protocolFeeOut, refFeeOut: _refFeeOut }
}

function loadGetterTupleAmountOut(source: TupleReader) {
  let _swapOut = source.readBigNumber()
  let _protocolFeeOut = source.readBigNumber()
  let _refFeeOut = source.readBigNumber()
  return { $$type: 'AmountOut' as const, swapOut: _swapOut, protocolFeeOut: _protocolFeeOut, refFeeOut: _refFeeOut }
}

function storeTupleAmountOut(source: AmountOut) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.swapOut)
  builder.writeNumber(source.protocolFeeOut)
  builder.writeNumber(source.refFeeOut)
  return builder.build()
}

function dictValueParserAmountOut(): DictionaryValue<AmountOut> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeAmountOut(src)).endCell())
    },
    parse: (src) => {
      return loadAmountOut(src.loadRef().beginParse())
    },
  }
}

export type PoolData = {
  $$type: 'PoolData'
  reserve0: bigint
  reserve1: bigint
  totalSupply: bigint
  token0Address: Address
  token1Address: Address
  lpFee: bigint
  protocolFee: bigint
  refFee: bigint
  protocolFeeAddress: Address | null
  collectedToken0ProtocolFee: bigint
  collectedToken1ProtocolFee: bigint
}

export function storePoolData(src: PoolData) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeInt(src.reserve0, 257)
    b_0.storeInt(src.reserve1, 257)
    b_0.storeInt(src.totalSupply, 257)
    let b_1 = new Builder()
    b_1.storeAddress(src.token0Address)
    b_1.storeAddress(src.token1Address)
    b_1.storeUint(src.lpFee, 16)
    b_1.storeUint(src.protocolFee, 16)
    b_1.storeUint(src.refFee, 16)
    b_1.storeAddress(src.protocolFeeAddress)
    let b_2 = new Builder()
    b_2.storeInt(src.collectedToken0ProtocolFee, 257)
    b_2.storeInt(src.collectedToken1ProtocolFee, 257)
    b_1.storeRef(b_2.endCell())
    b_0.storeRef(b_1.endCell())
  }
}

export function loadPoolData(slice: Slice) {
  let sc_0 = slice
  let _reserve0 = sc_0.loadIntBig(257)
  let _reserve1 = sc_0.loadIntBig(257)
  let _totalSupply = sc_0.loadIntBig(257)
  let sc_1 = sc_0.loadRef().beginParse()
  let _token0Address = sc_1.loadAddress()
  let _token1Address = sc_1.loadAddress()
  let _lpFee = sc_1.loadUintBig(16)
  let _protocolFee = sc_1.loadUintBig(16)
  let _refFee = sc_1.loadUintBig(16)
  let _protocolFeeAddress = sc_1.loadMaybeAddress()
  let sc_2 = sc_1.loadRef().beginParse()
  let _collectedToken0ProtocolFee = sc_2.loadIntBig(257)
  let _collectedToken1ProtocolFee = sc_2.loadIntBig(257)
  return {
    $$type: 'PoolData' as const,
    reserve0: _reserve0,
    reserve1: _reserve1,
    totalSupply: _totalSupply,
    token0Address: _token0Address,
    token1Address: _token1Address,
    lpFee: _lpFee,
    protocolFee: _protocolFee,
    refFee: _refFee,
    protocolFeeAddress: _protocolFeeAddress,
    collectedToken0ProtocolFee: _collectedToken0ProtocolFee,
    collectedToken1ProtocolFee: _collectedToken1ProtocolFee,
  }
}

function loadTuplePoolData(source: TupleReader) {
  let _reserve0 = source.readBigNumber()
  let _reserve1 = source.readBigNumber()
  let _totalSupply = source.readBigNumber()
  let _token0Address = source.readAddress()
  let _token1Address = source.readAddress()
  let _lpFee = source.readBigNumber()
  let _protocolFee = source.readBigNumber()
  let _refFee = source.readBigNumber()
  let _protocolFeeAddress = source.readAddressOpt()
  let _collectedToken0ProtocolFee = source.readBigNumber()
  let _collectedToken1ProtocolFee = source.readBigNumber()
  return {
    $$type: 'PoolData' as const,
    reserve0: _reserve0,
    reserve1: _reserve1,
    totalSupply: _totalSupply,
    token0Address: _token0Address,
    token1Address: _token1Address,
    lpFee: _lpFee,
    protocolFee: _protocolFee,
    refFee: _refFee,
    protocolFeeAddress: _protocolFeeAddress,
    collectedToken0ProtocolFee: _collectedToken0ProtocolFee,
    collectedToken1ProtocolFee: _collectedToken1ProtocolFee,
  }
}

function loadGetterTuplePoolData(source: TupleReader) {
  let _reserve0 = source.readBigNumber()
  let _reserve1 = source.readBigNumber()
  let _totalSupply = source.readBigNumber()
  let _token0Address = source.readAddress()
  let _token1Address = source.readAddress()
  let _lpFee = source.readBigNumber()
  let _protocolFee = source.readBigNumber()
  let _refFee = source.readBigNumber()
  let _protocolFeeAddress = source.readAddressOpt()
  let _collectedToken0ProtocolFee = source.readBigNumber()
  let _collectedToken1ProtocolFee = source.readBigNumber()
  return {
    $$type: 'PoolData' as const,
    reserve0: _reserve0,
    reserve1: _reserve1,
    totalSupply: _totalSupply,
    token0Address: _token0Address,
    token1Address: _token1Address,
    lpFee: _lpFee,
    protocolFee: _protocolFee,
    refFee: _refFee,
    protocolFeeAddress: _protocolFeeAddress,
    collectedToken0ProtocolFee: _collectedToken0ProtocolFee,
    collectedToken1ProtocolFee: _collectedToken1ProtocolFee,
  }
}

function storeTuplePoolData(source: PoolData) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.reserve0)
  builder.writeNumber(source.reserve1)
  builder.writeNumber(source.totalSupply)
  builder.writeAddress(source.token0Address)
  builder.writeAddress(source.token1Address)
  builder.writeNumber(source.lpFee)
  builder.writeNumber(source.protocolFee)
  builder.writeNumber(source.refFee)
  builder.writeAddress(source.protocolFeeAddress)
  builder.writeNumber(source.collectedToken0ProtocolFee)
  builder.writeNumber(source.collectedToken1ProtocolFee)
  return builder.build()
}

function dictValueParserPoolData(): DictionaryValue<PoolData> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storePoolData(src)).endCell())
    },
    parse: (src) => {
      return loadPoolData(src.loadRef().beginParse())
    },
  }
}

export type ExpectedOutputs = {
  $$type: 'ExpectedOutputs'
  amountOut: bigint
  protocolFeeOut: bigint
  refFeeOut: bigint
}

export function storeExpectedOutputs(src: ExpectedOutputs) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeInt(src.amountOut, 257)
    b_0.storeInt(src.protocolFeeOut, 257)
    b_0.storeInt(src.refFeeOut, 257)
  }
}

export function loadExpectedOutputs(slice: Slice) {
  let sc_0 = slice
  let _amountOut = sc_0.loadIntBig(257)
  let _protocolFeeOut = sc_0.loadIntBig(257)
  let _refFeeOut = sc_0.loadIntBig(257)
  return {
    $$type: 'ExpectedOutputs' as const,
    amountOut: _amountOut,
    protocolFeeOut: _protocolFeeOut,
    refFeeOut: _refFeeOut,
  }
}

function loadTupleExpectedOutputs(source: TupleReader) {
  let _amountOut = source.readBigNumber()
  let _protocolFeeOut = source.readBigNumber()
  let _refFeeOut = source.readBigNumber()
  return {
    $$type: 'ExpectedOutputs' as const,
    amountOut: _amountOut,
    protocolFeeOut: _protocolFeeOut,
    refFeeOut: _refFeeOut,
  }
}

function loadGetterTupleExpectedOutputs(source: TupleReader) {
  let _amountOut = source.readBigNumber()
  let _protocolFeeOut = source.readBigNumber()
  let _refFeeOut = source.readBigNumber()
  return {
    $$type: 'ExpectedOutputs' as const,
    amountOut: _amountOut,
    protocolFeeOut: _protocolFeeOut,
    refFeeOut: _refFeeOut,
  }
}

function storeTupleExpectedOutputs(source: ExpectedOutputs) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.amountOut)
  builder.writeNumber(source.protocolFeeOut)
  builder.writeNumber(source.refFeeOut)
  return builder.build()
}

function dictValueParserExpectedOutputs(): DictionaryValue<ExpectedOutputs> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeExpectedOutputs(src)).endCell())
    },
    parse: (src) => {
      return loadExpectedOutputs(src.loadRef().beginParse())
    },
  }
}

export type ExpectedLiquidityOutputs = {
  $$type: 'ExpectedLiquidityOutputs'
  amount0: bigint
  amount1: bigint
}

export function storeExpectedLiquidityOutputs(src: ExpectedLiquidityOutputs) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeInt(src.amount0, 257)
    b_0.storeInt(src.amount1, 257)
  }
}

export function loadExpectedLiquidityOutputs(slice: Slice) {
  let sc_0 = slice
  let _amount0 = sc_0.loadIntBig(257)
  let _amount1 = sc_0.loadIntBig(257)
  return { $$type: 'ExpectedLiquidityOutputs' as const, amount0: _amount0, amount1: _amount1 }
}

function loadTupleExpectedLiquidityOutputs(source: TupleReader) {
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  return { $$type: 'ExpectedLiquidityOutputs' as const, amount0: _amount0, amount1: _amount1 }
}

function loadGetterTupleExpectedLiquidityOutputs(source: TupleReader) {
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  return { $$type: 'ExpectedLiquidityOutputs' as const, amount0: _amount0, amount1: _amount1 }
}

function storeTupleExpectedLiquidityOutputs(source: ExpectedLiquidityOutputs) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.amount0)
  builder.writeNumber(source.amount1)
  return builder.build()
}

function dictValueParserExpectedLiquidityOutputs(): DictionaryValue<ExpectedLiquidityOutputs> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeExpectedLiquidityOutputs(src)).endCell())
    },
    parse: (src) => {
      return loadExpectedLiquidityOutputs(src.loadRef().beginParse())
    },
  }
}

export type JettonData = {
  $$type: 'JettonData'
  totalSupply: bigint
  mintable: bigint
  adminAddress: Address
  jettonContent: Cell
  jettonWalletCode: Cell
}

export function storeJettonData(src: JettonData) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeInt(src.totalSupply, 257)
    b_0.storeInt(src.mintable, 257)
    b_0.storeAddress(src.adminAddress)
    b_0.storeRef(src.jettonContent)
    b_0.storeRef(src.jettonWalletCode)
  }
}

export function loadJettonData(slice: Slice) {
  let sc_0 = slice
  let _totalSupply = sc_0.loadIntBig(257)
  let _mintable = sc_0.loadIntBig(257)
  let _adminAddress = sc_0.loadAddress()
  let _jettonContent = sc_0.loadRef()
  let _jettonWalletCode = sc_0.loadRef()
  return {
    $$type: 'JettonData' as const,
    totalSupply: _totalSupply,
    mintable: _mintable,
    adminAddress: _adminAddress,
    jettonContent: _jettonContent,
    jettonWalletCode: _jettonWalletCode,
  }
}

function loadTupleJettonData(source: TupleReader) {
  let _totalSupply = source.readBigNumber()
  let _mintable = source.readBigNumber()
  let _adminAddress = source.readAddress()
  let _jettonContent = source.readCell()
  let _jettonWalletCode = source.readCell()
  return {
    $$type: 'JettonData' as const,
    totalSupply: _totalSupply,
    mintable: _mintable,
    adminAddress: _adminAddress,
    jettonContent: _jettonContent,
    jettonWalletCode: _jettonWalletCode,
  }
}

function loadGetterTupleJettonData(source: TupleReader) {
  let _totalSupply = source.readBigNumber()
  let _mintable = source.readBigNumber()
  let _adminAddress = source.readAddress()
  let _jettonContent = source.readCell()
  let _jettonWalletCode = source.readCell()
  return {
    $$type: 'JettonData' as const,
    totalSupply: _totalSupply,
    mintable: _mintable,
    adminAddress: _adminAddress,
    jettonContent: _jettonContent,
    jettonWalletCode: _jettonWalletCode,
  }
}

function storeTupleJettonData(source: JettonData) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.totalSupply)
  builder.writeNumber(source.mintable)
  builder.writeAddress(source.adminAddress)
  builder.writeCell(source.jettonContent)
  builder.writeCell(source.jettonWalletCode)
  return builder.build()
}

function dictValueParserJettonData(): DictionaryValue<JettonData> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeJettonData(src)).endCell())
    },
    parse: (src) => {
      return loadJettonData(src.loadRef().beginParse())
    },
  }
}

export type GetterLPAccountData = {
  $$type: 'GetterLPAccountData'
  userAddress: Address
  poolAddress: Address
  amount0: bigint
  amount1: bigint
}

export function storeGetterLPAccountData(src: GetterLPAccountData) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeAddress(src.userAddress)
    b_0.storeAddress(src.poolAddress)
    b_0.storeInt(src.amount0, 257)
    let b_1 = new Builder()
    b_1.storeInt(src.amount1, 257)
    b_0.storeRef(b_1.endCell())
  }
}

export function loadGetterLPAccountData(slice: Slice) {
  let sc_0 = slice
  let _userAddress = sc_0.loadAddress()
  let _poolAddress = sc_0.loadAddress()
  let _amount0 = sc_0.loadIntBig(257)
  let sc_1 = sc_0.loadRef().beginParse()
  let _amount1 = sc_1.loadIntBig(257)
  return {
    $$type: 'GetterLPAccountData' as const,
    userAddress: _userAddress,
    poolAddress: _poolAddress,
    amount0: _amount0,
    amount1: _amount1,
  }
}

function loadTupleGetterLPAccountData(source: TupleReader) {
  let _userAddress = source.readAddress()
  let _poolAddress = source.readAddress()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  return {
    $$type: 'GetterLPAccountData' as const,
    userAddress: _userAddress,
    poolAddress: _poolAddress,
    amount0: _amount0,
    amount1: _amount1,
  }
}

function loadGetterTupleGetterLPAccountData(source: TupleReader) {
  let _userAddress = source.readAddress()
  let _poolAddress = source.readAddress()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  return {
    $$type: 'GetterLPAccountData' as const,
    userAddress: _userAddress,
    poolAddress: _poolAddress,
    amount0: _amount0,
    amount1: _amount1,
  }
}

function storeTupleGetterLPAccountData(source: GetterLPAccountData) {
  let builder = new TupleBuilder()
  builder.writeAddress(source.userAddress)
  builder.writeAddress(source.poolAddress)
  builder.writeNumber(source.amount0)
  builder.writeNumber(source.amount1)
  return builder.build()
}

function dictValueParserGetterLPAccountData(): DictionaryValue<GetterLPAccountData> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeGetterLPAccountData(src)).endCell())
    },
    parse: (src) => {
      return loadGetterLPAccountData(src.loadRef().beginParse())
    },
  }
}

export type LpAccount$Data = {
  $$type: 'LpAccount$Data'
  amount0: bigint
  amount1: bigint
  userAddress: Address
  poolAddress: Address
}

export function storeLpAccount$Data(src: LpAccount$Data) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeInt(src.amount0, 257)
    b_0.storeInt(src.amount1, 257)
    b_0.storeAddress(src.userAddress)
    let b_1 = new Builder()
    b_1.storeAddress(src.poolAddress)
    b_0.storeRef(b_1.endCell())
  }
}

export function loadLpAccount$Data(slice: Slice) {
  let sc_0 = slice
  let _amount0 = sc_0.loadIntBig(257)
  let _amount1 = sc_0.loadIntBig(257)
  let _userAddress = sc_0.loadAddress()
  let sc_1 = sc_0.loadRef().beginParse()
  let _poolAddress = sc_1.loadAddress()
  return {
    $$type: 'LpAccount$Data' as const,
    amount0: _amount0,
    amount1: _amount1,
    userAddress: _userAddress,
    poolAddress: _poolAddress,
  }
}

function loadTupleLpAccount$Data(source: TupleReader) {
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  let _userAddress = source.readAddress()
  let _poolAddress = source.readAddress()
  return {
    $$type: 'LpAccount$Data' as const,
    amount0: _amount0,
    amount1: _amount1,
    userAddress: _userAddress,
    poolAddress: _poolAddress,
  }
}

function loadGetterTupleLpAccount$Data(source: TupleReader) {
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  let _userAddress = source.readAddress()
  let _poolAddress = source.readAddress()
  return {
    $$type: 'LpAccount$Data' as const,
    amount0: _amount0,
    amount1: _amount1,
    userAddress: _userAddress,
    poolAddress: _poolAddress,
  }
}

function storeTupleLpAccount$Data(source: LpAccount$Data) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.amount0)
  builder.writeNumber(source.amount1)
  builder.writeAddress(source.userAddress)
  builder.writeAddress(source.poolAddress)
  return builder.build()
}

function dictValueParserLpAccount$Data(): DictionaryValue<LpAccount$Data> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeLpAccount$Data(src)).endCell())
    },
    parse: (src) => {
      return loadLpAccount$Data(src.loadRef().beginParse())
    },
  }
}

export type LpWallet$Data = {
  $$type: 'LpWallet$Data'
  balance: bigint
  owner: Address
  master: Address
}

export function storeLpWallet$Data(src: LpWallet$Data) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeCoins(src.balance)
    b_0.storeAddress(src.owner)
    b_0.storeAddress(src.master)
  }
}

export function loadLpWallet$Data(slice: Slice) {
  let sc_0 = slice
  let _balance = sc_0.loadCoins()
  let _owner = sc_0.loadAddress()
  let _master = sc_0.loadAddress()
  return { $$type: 'LpWallet$Data' as const, balance: _balance, owner: _owner, master: _master }
}

function loadTupleLpWallet$Data(source: TupleReader) {
  let _balance = source.readBigNumber()
  let _owner = source.readAddress()
  let _master = source.readAddress()
  return { $$type: 'LpWallet$Data' as const, balance: _balance, owner: _owner, master: _master }
}

function loadGetterTupleLpWallet$Data(source: TupleReader) {
  let _balance = source.readBigNumber()
  let _owner = source.readAddress()
  let _master = source.readAddress()
  return { $$type: 'LpWallet$Data' as const, balance: _balance, owner: _owner, master: _master }
}

function storeTupleLpWallet$Data(source: LpWallet$Data) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.balance)
  builder.writeAddress(source.owner)
  builder.writeAddress(source.master)
  return builder.build()
}

function dictValueParserLpWallet$Data(): DictionaryValue<LpWallet$Data> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeLpWallet$Data(src)).endCell())
    },
    parse: (src) => {
      return loadLpWallet$Data(src.loadRef().beginParse())
    },
  }
}

export type StateInitWithAddress = {
  $$type: 'StateInitWithAddress'
  stateInit: StateInit
  address: Address
}

export function storeStateInitWithAddress(src: StateInitWithAddress) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.store(storeStateInit(src.stateInit))
    b_0.storeAddress(src.address)
  }
}

export function loadStateInitWithAddress(slice: Slice) {
  let sc_0 = slice
  let _stateInit = loadStateInit(sc_0)
  let _address = sc_0.loadAddress()
  return { $$type: 'StateInitWithAddress' as const, stateInit: _stateInit, address: _address }
}

function loadTupleStateInitWithAddress(source: TupleReader) {
  const _stateInit = loadTupleStateInit(source)
  let _address = source.readAddress()
  return { $$type: 'StateInitWithAddress' as const, stateInit: _stateInit, address: _address }
}

function loadGetterTupleStateInitWithAddress(source: TupleReader) {
  const _stateInit = loadGetterTupleStateInit(source)
  let _address = source.readAddress()
  return { $$type: 'StateInitWithAddress' as const, stateInit: _stateInit, address: _address }
}

function storeTupleStateInitWithAddress(source: StateInitWithAddress) {
  let builder = new TupleBuilder()
  builder.writeTuple(storeTupleStateInit(source.stateInit))
  builder.writeAddress(source.address)
  return builder.build()
}

function dictValueParserStateInitWithAddress(): DictionaryValue<StateInitWithAddress> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeStateInitWithAddress(src)).endCell())
    },
    parse: (src) => {
      return loadStateInitWithAddress(src.loadRef().beginParse())
    },
  }
}

export type AddLiquidity = {
  $$type: 'AddLiquidity'
  queryId: bigint
  newAmount0: bigint
  newAmount1: bigint
  minLPOut: bigint
}

export function storeAddLiquidity(src: AddLiquidity) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3906656429, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeCoins(src.newAmount0)
    b_0.storeCoins(src.newAmount1)
    b_0.storeCoins(src.minLPOut)
  }
}

export function loadAddLiquidity(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3906656429) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _newAmount0 = sc_0.loadCoins()
  let _newAmount1 = sc_0.loadCoins()
  let _minLPOut = sc_0.loadCoins()
  return {
    $$type: 'AddLiquidity' as const,
    queryId: _queryId,
    newAmount0: _newAmount0,
    newAmount1: _newAmount1,
    minLPOut: _minLPOut,
  }
}

function loadTupleAddLiquidity(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _newAmount0 = source.readBigNumber()
  let _newAmount1 = source.readBigNumber()
  let _minLPOut = source.readBigNumber()
  return {
    $$type: 'AddLiquidity' as const,
    queryId: _queryId,
    newAmount0: _newAmount0,
    newAmount1: _newAmount1,
    minLPOut: _minLPOut,
  }
}

function loadGetterTupleAddLiquidity(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _newAmount0 = source.readBigNumber()
  let _newAmount1 = source.readBigNumber()
  let _minLPOut = source.readBigNumber()
  return {
    $$type: 'AddLiquidity' as const,
    queryId: _queryId,
    newAmount0: _newAmount0,
    newAmount1: _newAmount1,
    minLPOut: _minLPOut,
  }
}

function storeTupleAddLiquidity(source: AddLiquidity) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.newAmount0)
  builder.writeNumber(source.newAmount1)
  builder.writeNumber(source.minLPOut)
  return builder.build()
}

function dictValueParserAddLiquidity(): DictionaryValue<AddLiquidity> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeAddLiquidity(src)).endCell())
    },
    parse: (src) => {
      return loadAddLiquidity(src.loadRef().beginParse())
    },
  }
}

export type LPAccountData = {
  $$type: 'LPAccountData'
  queryId: bigint
}

export function storeLPAccountData(src: LPAccountData) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(815693602, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadLPAccountData(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 815693602) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'LPAccountData' as const, queryId: _queryId }
}

function loadTupleLPAccountData(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'LPAccountData' as const, queryId: _queryId }
}

function loadGetterTupleLPAccountData(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'LPAccountData' as const, queryId: _queryId }
}

function storeTupleLPAccountData(source: LPAccountData) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserLPAccountData(): DictionaryValue<LPAccountData> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeLPAccountData(src)).endCell())
    },
    parse: (src) => {
      return loadLPAccountData(src.loadRef().beginParse())
    },
  }
}

export type LPAccountDataResponse = {
  $$type: 'LPAccountDataResponse'
  queryId: bigint
  userAddress: Address
  poolAddress: Address
  amount0: bigint
  amount1: bigint
}

export function storeLPAccountDataResponse(src: LPAccountDataResponse) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(3012634219, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeAddress(src.userAddress)
    b_0.storeAddress(src.poolAddress)
    b_0.storeInt(src.amount0, 257)
    let b_1 = new Builder()
    b_1.storeInt(src.amount1, 257)
    b_0.storeRef(b_1.endCell())
  }
}

export function loadLPAccountDataResponse(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 3012634219) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _userAddress = sc_0.loadAddress()
  let _poolAddress = sc_0.loadAddress()
  let _amount0 = sc_0.loadIntBig(257)
  let sc_1 = sc_0.loadRef().beginParse()
  let _amount1 = sc_1.loadIntBig(257)
  return {
    $$type: 'LPAccountDataResponse' as const,
    queryId: _queryId,
    userAddress: _userAddress,
    poolAddress: _poolAddress,
    amount0: _amount0,
    amount1: _amount1,
  }
}

function loadTupleLPAccountDataResponse(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _userAddress = source.readAddress()
  let _poolAddress = source.readAddress()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  return {
    $$type: 'LPAccountDataResponse' as const,
    queryId: _queryId,
    userAddress: _userAddress,
    poolAddress: _poolAddress,
    amount0: _amount0,
    amount1: _amount1,
  }
}

function loadGetterTupleLPAccountDataResponse(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _userAddress = source.readAddress()
  let _poolAddress = source.readAddress()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  return {
    $$type: 'LPAccountDataResponse' as const,
    queryId: _queryId,
    userAddress: _userAddress,
    poolAddress: _poolAddress,
    amount0: _amount0,
    amount1: _amount1,
  }
}

function storeTupleLPAccountDataResponse(source: LPAccountDataResponse) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeAddress(source.userAddress)
  builder.writeAddress(source.poolAddress)
  builder.writeNumber(source.amount0)
  builder.writeNumber(source.amount1)
  return builder.build()
}

function dictValueParserLPAccountDataResponse(): DictionaryValue<LPAccountDataResponse> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeLPAccountDataResponse(src)).endCell())
    },
    parse: (src) => {
      return loadLPAccountDataResponse(src.loadRef().beginParse())
    },
  }
}

export type RefundMe = {
  $$type: 'RefundMe'
  queryId: bigint
}

export function storeRefundMe(src: RefundMe) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(866697170, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadRefundMe(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 866697170) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'RefundMe' as const, queryId: _queryId }
}

function loadTupleRefundMe(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'RefundMe' as const, queryId: _queryId }
}

function loadGetterTupleRefundMe(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'RefundMe' as const, queryId: _queryId }
}

function storeTupleRefundMe(source: RefundMe) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserRefundMe(): DictionaryValue<RefundMe> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeRefundMe(src)).endCell())
    },
    parse: (src) => {
      return loadRefundMe(src.loadRef().beginParse())
    },
  }
}

export type DirectAddLiquidity = {
  $$type: 'DirectAddLiquidity'
  queryId: bigint
  amount0: bigint
  amount1: bigint
  minLPOut: bigint
}

export function storeDirectAddLiquidity(src: DirectAddLiquidity) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(1626297064, 32)
    b_0.storeUint(src.queryId, 64)
    b_0.storeCoins(src.amount0)
    b_0.storeCoins(src.amount1)
    b_0.storeCoins(src.minLPOut)
  }
}

export function loadDirectAddLiquidity(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 1626297064) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  let _amount0 = sc_0.loadCoins()
  let _amount1 = sc_0.loadCoins()
  let _minLPOut = sc_0.loadCoins()
  return {
    $$type: 'DirectAddLiquidity' as const,
    queryId: _queryId,
    amount0: _amount0,
    amount1: _amount1,
    minLPOut: _minLPOut,
  }
}

function loadTupleDirectAddLiquidity(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  let _minLPOut = source.readBigNumber()
  return {
    $$type: 'DirectAddLiquidity' as const,
    queryId: _queryId,
    amount0: _amount0,
    amount1: _amount1,
    minLPOut: _minLPOut,
  }
}

function loadGetterTupleDirectAddLiquidity(source: TupleReader) {
  let _queryId = source.readBigNumber()
  let _amount0 = source.readBigNumber()
  let _amount1 = source.readBigNumber()
  let _minLPOut = source.readBigNumber()
  return {
    $$type: 'DirectAddLiquidity' as const,
    queryId: _queryId,
    amount0: _amount0,
    amount1: _amount1,
    minLPOut: _minLPOut,
  }
}

function storeTupleDirectAddLiquidity(source: DirectAddLiquidity) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  builder.writeNumber(source.amount0)
  builder.writeNumber(source.amount1)
  builder.writeNumber(source.minLPOut)
  return builder.build()
}

function dictValueParserDirectAddLiquidity(): DictionaryValue<DirectAddLiquidity> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeDirectAddLiquidity(src)).endCell())
    },
    parse: (src) => {
      return loadDirectAddLiquidity(src.loadRef().beginParse())
    },
  }
}

export type ResetGas = {
  $$type: 'ResetGas'
  queryId: bigint
}

export function storeResetGas(src: ResetGas) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(2445011226, 32)
    b_0.storeUint(src.queryId, 64)
  }
}

export function loadResetGas(slice: Slice) {
  let sc_0 = slice
  if (sc_0.loadUint(32) !== 2445011226) {
    throw Error('Invalid prefix')
  }
  let _queryId = sc_0.loadUintBig(64)
  return { $$type: 'ResetGas' as const, queryId: _queryId }
}

function loadTupleResetGas(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'ResetGas' as const, queryId: _queryId }
}

function loadGetterTupleResetGas(source: TupleReader) {
  let _queryId = source.readBigNumber()
  return { $$type: 'ResetGas' as const, queryId: _queryId }
}

function storeTupleResetGas(source: ResetGas) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.queryId)
  return builder.build()
}

function dictValueParserResetGas(): DictionaryValue<ResetGas> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeResetGas(src)).endCell())
    },
    parse: (src) => {
      return loadResetGas(src.loadRef().beginParse())
    },
  }
}

export type Upgrade = {
  $$type: 'Upgrade'
  endCode: bigint
  endAdmin: bigint
  admin: Address | null
  adminConfirmed: boolean
  code: Cell | null
}

export function storeUpgrade(src: Upgrade) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeUint(src.endCode, 64)
    b_0.storeUint(src.endAdmin, 64)
    b_0.storeAddress(src.admin)
    b_0.storeBit(src.adminConfirmed)
    if (src.code !== null && src.code !== undefined) {
      b_0.storeBit(true).storeRef(src.code)
    } else {
      b_0.storeBit(false)
    }
  }
}

export function loadUpgrade(slice: Slice) {
  let sc_0 = slice
  let _endCode = sc_0.loadUintBig(64)
  let _endAdmin = sc_0.loadUintBig(64)
  let _admin = sc_0.loadMaybeAddress()
  let _adminConfirmed = sc_0.loadBit()
  let _code = sc_0.loadBit() ? sc_0.loadRef() : null
  return {
    $$type: 'Upgrade' as const,
    endCode: _endCode,
    endAdmin: _endAdmin,
    admin: _admin,
    adminConfirmed: _adminConfirmed,
    code: _code,
  }
}

function loadTupleUpgrade(source: TupleReader) {
  let _endCode = source.readBigNumber()
  let _endAdmin = source.readBigNumber()
  let _admin = source.readAddressOpt()
  let _adminConfirmed = source.readBoolean()
  let _code = source.readCellOpt()
  return {
    $$type: 'Upgrade' as const,
    endCode: _endCode,
    endAdmin: _endAdmin,
    admin: _admin,
    adminConfirmed: _adminConfirmed,
    code: _code,
  }
}

function loadGetterTupleUpgrade(source: TupleReader) {
  let _endCode = source.readBigNumber()
  let _endAdmin = source.readBigNumber()
  let _admin = source.readAddressOpt()
  let _adminConfirmed = source.readBoolean()
  let _code = source.readCellOpt()
  return {
    $$type: 'Upgrade' as const,
    endCode: _endCode,
    endAdmin: _endAdmin,
    admin: _admin,
    adminConfirmed: _adminConfirmed,
    code: _code,
  }
}

function storeTupleUpgrade(source: Upgrade) {
  let builder = new TupleBuilder()
  builder.writeNumber(source.endCode)
  builder.writeNumber(source.endAdmin)
  builder.writeAddress(source.admin)
  builder.writeBoolean(source.adminConfirmed)
  builder.writeCell(source.code)
  return builder.build()
}

function dictValueParserUpgrade(): DictionaryValue<Upgrade> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeUpgrade(src)).endCell())
    },
    parse: (src) => {
      return loadUpgrade(src.loadRef().beginParse())
    },
  }
}

export type RouterData = {
  $$type: 'RouterData'
  locked: boolean
  adminAddress: Address
  tempUpgrade: Upgrade
}

export function storeRouterData(src: RouterData) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeBit(src.locked)
    b_0.storeAddress(src.adminAddress)
    b_0.store(storeUpgrade(src.tempUpgrade))
  }
}

export function loadRouterData(slice: Slice) {
  let sc_0 = slice
  let _locked = sc_0.loadBit()
  let _adminAddress = sc_0.loadAddress()
  let _tempUpgrade = loadUpgrade(sc_0)
  return { $$type: 'RouterData' as const, locked: _locked, adminAddress: _adminAddress, tempUpgrade: _tempUpgrade }
}

function loadTupleRouterData(source: TupleReader) {
  let _locked = source.readBoolean()
  let _adminAddress = source.readAddress()
  const _tempUpgrade = loadTupleUpgrade(source)
  return { $$type: 'RouterData' as const, locked: _locked, adminAddress: _adminAddress, tempUpgrade: _tempUpgrade }
}

function loadGetterTupleRouterData(source: TupleReader) {
  let _locked = source.readBoolean()
  let _adminAddress = source.readAddress()
  const _tempUpgrade = loadGetterTupleUpgrade(source)
  return { $$type: 'RouterData' as const, locked: _locked, adminAddress: _adminAddress, tempUpgrade: _tempUpgrade }
}

function storeTupleRouterData(source: RouterData) {
  let builder = new TupleBuilder()
  builder.writeBoolean(source.locked)
  builder.writeAddress(source.adminAddress)
  builder.writeTuple(storeTupleUpgrade(source.tempUpgrade))
  return builder.build()
}

function dictValueParserRouterData(): DictionaryValue<RouterData> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeRouterData(src)).endCell())
    },
    parse: (src) => {
      return loadRouterData(src.loadRef().beginParse())
    },
  }
}

export type Router$Data = {
  $$type: 'Router$Data'
  tempUpgrade: Upgrade
  locked: boolean
  adminAddress: Address
}

export function storeRouter$Data(src: Router$Data) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.store(storeUpgrade(src.tempUpgrade))
    b_0.storeBit(src.locked)
    b_0.storeAddress(src.adminAddress)
  }
}

export function loadRouter$Data(slice: Slice) {
  let sc_0 = slice
  let _tempUpgrade = loadUpgrade(sc_0)
  let _locked = sc_0.loadBit()
  let _adminAddress = sc_0.loadAddress()
  return { $$type: 'Router$Data' as const, tempUpgrade: _tempUpgrade, locked: _locked, adminAddress: _adminAddress }
}

function loadTupleRouter$Data(source: TupleReader) {
  const _tempUpgrade = loadTupleUpgrade(source)
  let _locked = source.readBoolean()
  let _adminAddress = source.readAddress()
  return { $$type: 'Router$Data' as const, tempUpgrade: _tempUpgrade, locked: _locked, adminAddress: _adminAddress }
}

function loadGetterTupleRouter$Data(source: TupleReader) {
  const _tempUpgrade = loadGetterTupleUpgrade(source)
  let _locked = source.readBoolean()
  let _adminAddress = source.readAddress()
  return { $$type: 'Router$Data' as const, tempUpgrade: _tempUpgrade, locked: _locked, adminAddress: _adminAddress }
}

function storeTupleRouter$Data(source: Router$Data) {
  let builder = new TupleBuilder()
  builder.writeTuple(storeTupleUpgrade(source.tempUpgrade))
  builder.writeBoolean(source.locked)
  builder.writeAddress(source.adminAddress)
  return builder.build()
}

function dictValueParserRouter$Data(): DictionaryValue<Router$Data> {
  return {
    serialize: (src, builder) => {
      builder.storeRef(beginCell().store(storeRouter$Data(src)).endCell())
    },
    parse: (src) => {
      return loadRouter$Data(src.loadRef().beginParse())
    },
  }
}

type Pool_init_args = {
  $$type: 'Pool_init_args'
  router: Address
  token0Address: Address
  token1Address: Address
}

function initPool_init_args(src: Pool_init_args) {
  return (builder: Builder) => {
    let b_0 = builder
    b_0.storeAddress(src.router)
    b_0.storeAddress(src.token0Address)
    b_0.storeAddress(src.token1Address)
  }
}

async function Pool_init(router: Address, token0Address: Address, token1Address: Address) {
  const __code = Cell.fromBase64(
    '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',
  )
  const __system = Cell.fromBase64(
    'te6cckECmgEAJsAAAQHAAQIBIAKCAgFYAxwBBbdPEAQBFP8A9KQT9LzyyAsFAgFiBhUDetAB0NMDAXGwowH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIVFBTA28E+GEC+GLbPFUS2zzy4IIXBxQC7gGOW4Ag1yFwIddJwh+VMCDXCx/eIIIQF41FGbqOGjDTHwGCEBeNRRm68uCB0z/6AFlsEjEToAJ/4IIQe92X3rqOGdMfAYIQe92X3rry4IHTP/oAWWwSMROgAn/gMH/gcCHXScIflTAg1wsf3iCCEA+KfqW64wIgCAwCEDDbPGwX2zx/CQoA6tMfAYIQD4p+pbry4IHTP/oA+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAEg1wsBwwCOH/pAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IiUctchbeIB0gABkdSSbQHi+gDSAAGR1JJtAeJVYAOCMvhBbyT4QlLAxwXy4TckwgCRcpFx4kQwUkTbPAGoggkxLQCgggiYloCgIqC88uE+UYShIML/8uE/+ENUEEfbPFwyeAsCxHBZyHABywFzAcsBcAHLABLMzMn5AMhyAcsBcAHLABLKB8v/ydAg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIUHZwgEB/LEgTUOfIVVDbPMkQVl4iEDkCEDYQNRA02zwwLJAD1IIQF41FGbqPCDDbPGwW2zx/4IIQWV8HvLqOzNMfAYIQWV8HvLry4IHTP/oAINcLAcMAjh/6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIlHLXIW3iAdIAAZHUkm0B4lUwbBTgMHANDhIA2NMfAYIQF41FGbry4IHTP/oA+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAEg1wsBwwCOH/pAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IiUctchbeIB+gDSAAGR1JJtAeJVUATi+EFvJFOixwWzjs74Q1OL2zxwWchwAcsBcwHLAXABywASzMzJ+QDIcgHLAXABywASygfL/8nQINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiFIwxwXy4UDeUcigIML/8uE/QLor2zwQNEvN2zwjwgB4DzIQACz4J28QIaGCCJiWgGa2CKGCCJiWgKChAu6O3lGjoVAKoXFwKEgTUHTIVTCCEHNi0JxQBcsfE8s/AfoCASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFiFus5V/AcoAzJRwMsoA4sknRhRQVRRDMG1t2zwwUAWVMBA1bEHiIW6zkyXCAJFw4pI1W+MNAZARAUQBIG7y0IBwA8gBghDVMnbbWMsfyz/JRjByECRDAG1t2zwwkAO++EFvJPhCUqDHBfLhN3BTBW6zn1sEIG7y0IDQ+gD6ADBQVZE24lG3oSDC//LhP0QwUkTbPDABghAJiWgAvvLhPlBDcIBAfylGE1C4yFVQ2zzJJAQDUHcUQzBtbds8MH8yE5AAwIIQe92X3lAHyx8Vyz9QA/oCASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFgEgbpUwcAHLAY4eINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8W4gH6AgH6AgCeyPhDAcx/AcoAVSBa+gJYINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFsntVAIBIBYbAhG/2BbZ5tnjYaQXGgG67UTQ1AH4Y9IAAY5F+gD6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IhDMGwT4Pgo1wsKgwm68uCJGAGK+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIEgLRAds8GQAEcFkBGPhDUyHbPDBUYzBSMHgAEb4V92omhpAADAEFtovwHQEU/wD0pBP0vPLICx4CAWIfXQOa0AHQ0wMBcbCjAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IhUUFMDbwT4YQL4Yts8VRvbPPLggsj4QwHMfwHKAFWw2zzJ7VR6IFsE3AGSMH/gcCHXScIflTAg1wsf3iDAACLXScEhsJJbf+AgghCUapi2uo6oMNMfAYIQlGqYtrry4IHTPwExyAGCEK/5D1dYyx/LP8n4QgFwbds8f+AgghDI7A10uuMCIIIQmnXt7LrjAiCCEHvdl966jyEkLgF6MNMfAYIQyOwNdLry4IHTP/pAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB+gD6APoAVUBsFds8fyID6gsREAsQrxCeEI0QfAYREAYQXxBOED0QLAEREAEP2zz4Q/goQfDbPFxwWchwAcsBcwHLAXABywASzMzJ+QDIcgHLAXABywASygfL/8nQINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiBEQcBETcBETgEAREUtmIwF6yFUwghDo2titUAXLHxPLPwH6AgH6AgH6AskGERAGBRESBQQREQQQPlkQRhBF2zwwEGsQWhBJEDhHFUAGA5ABmDDTHwGCEJp17ey68uCB0z+BAQHXAIEBAdcA+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHUAdCBAQHXADAVFEMwbBXbPH8lBKr4QW8kE18DCxERCwoREAoQnxCOEH0QbAUREQUEERAEED9O3C7bPHBTDMAAjoxWFVYVqNs8IIED6KHjDiARFbmRf5ctVheghHe84pF/lyxWFqCEd7ziR4AmKAJsVhUuqC2pBFYVL6gtqQRctghSAhO5jowyIIED6FYXL1YS2zyOjzMggQPoVhhWEFYS2zxDE+ICJycAQO2i7fsgwgCOElBEqFADqQRSAqAiuZOh2zHgW5JfBeJwAq6O018DPz8/cHCAQiIDERUDAhEUAgEREwHIVTCCEOja2K1QBcsfE8s/AfoCAfoCAfoCyRBtBRESBQQREQQDERADQP4QRhBF2zwwEFsQShA5SBYFBENz4w6QKQP+bDNwgEBTQ6DCAI9iWw+CCJiWgIIAw1DbPHOpBHBTAaoADRERDQwREAwQvxCuCRERCQgREAgQfxBuBRERBQQREAQQPxAuclYYQxNWFgJWFAJWFALbPAwREAwQvxCuEJ0QjBB7EGoQWRBIEDdGRAWSVxHiAREUAQOhGqABEREBCSpQKwAi+CdvECOhIrYIEqEBcPg2oKEE/KEXoBEQGKD4KPhDU/HbPFxwWchwAcsBcwHLAXABywASzMzJ+QDIcgHLAXABywASygfL/8nQINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiA9ysQMRFAMCERACAREUARERcG3IVVDbPMkQXBBPED4CEREdf1VQ2zwwEFsQSngskC0A2IIQF41FGVAHyx8Vyz9QA/oCASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFgEgbpUwcAHLAY4eINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8W4gH6AiFus5V/AcoAzJRwMsoA4gAWEDkXGBBGEEUTREAEOo8IMNs8bBbbPH/gIIIQ5CBft7rjAiCCELUNMkS6LzA0RgDK0x8BghB73ZfeuvLggdM/+gD6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIASDXCwHDAI4f+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiJRy1yFt4gH6APoAVVAD9gsREQsKERAKEJ8QjhB9EGwFEREFBBEQBBA/Ttwv2zxfA4IAw1Bw+Db4QW8kVEEUVSDbPFMSvJWnBlIQvJIwcOLy4TABoVYRKagqqQRWEimoK6kEUhAREb6TUv++kj5w4vLhQlYRwgCTLcIAkXDiky7CAJFw4vLhMVGNoTEyMwGk+EP4KBLbPFxwWchwAcsBcwHLAXABywASzMzJ+QDIcgHLAXABywASygfL/8nQINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiPhCUhDHBfLhL3gAZGwx+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiDD6ADFx1yH6ADH6ADCnA6sAA+5RfqERERmhLm6zj08ngQCPqQQPIG7y0IBwclYUyAGCENUydttYyx/LP8lWElUgECQQI21t2zwwUH6hcCAMERIMCxERCwoREAoQfhC9EGwQWxBKEDkQNxVDMNs8jpk3PRCfEI4QfRBcEEsQihA5SBZQdHBQM9s84pBQTAIQMNs8bBmK2H81NwHs0x8BghDkIF+3uvLggdM/+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAfoA+gDUAdD6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIATYA7iDXCwHDAI4f+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiJRy1yFt4gH6ANQw0NIAAY4x+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAH6ANIAAZHUkm0B4lUgbBNvA5IwbeIQSRBIEEcQRhBFBPTtou37CxEUCwoREwoJERIJCBERCAcREAcQbxBeEE0QPAIRFAIBERMBERLbPIIAnEBw+Db4QW8kE18DgEBwLlYUxwWOi1YYVhNUfctT3Ns8jotWGFYTVHzbU9zbPOJWEVYXxwWSVhWRI+JWEgERGMcFkSOSVhXiVhDBAUs4ODkAiIEnEFADoRWoUgOoA4EnEKhYoBKpBHBTA8IAmTFSFKiBJxCpBJE04gRus5MhwgCRcOKaMlIQqIEnEKkEAZEx4lMhoKFZA5SRf5MjwQHik1cVf5VSMBEWueKOoV8HPj9XEFcQVxAQbxBeEE0QPEupEGgQVxBGRRRyVSDbPI8SVhbCAOMPS6AQKV4lEEZBBQQD4kw6PgOqUuARFqBTIaBWFqBS4KEhhHe8kX+TIMEB4o6jXwg+P1cQVxBXEBBvEF4QTRA8S6kQaBBXEEZFFHJVINs82zHgVxVXFlYUwgCXAhEUAjQ0MOMNVhVus0w7PAHObCICcAShVhehdFYZIG7y0IAlDxESDw4REQ4NERANDBESDAsREQsKERAKCRESCQgREQgHERAHBhESBgUREQUEERAEclYZBQERFwFWHAERGNs8EL4QrRCcEIsQehBpEFgQRxA2RRNQQlACfI63P1cUVxRXFAoREAoQnxCOEH0QbFVVBRETBXUEA3ADAhEUAgERFds8NjYQXAsQOkmAEFcQNkFVA+MNUMagUD0Cijk5cBEUIG7y0IBvIwgRFQgHERQHLlF+BxBWBRESBQQRGgQDERkDAhEaAgERGQERGshVoNs8yScEEDtPuxAkECNtbds8MEKQBP5WFMIAj9VS0BEWoFMhoFYWoFLwoSGEd7yRf5MgwQHijqNfCD4/VxBXEFcQEG8QXhBNEDxLqRBoEFcQRkUUclUg2zzbMeBXFVcWVhTCAJcCERQCNDQw4w1WFW6zjh5fBwgRFAgHERMHBhESBgUREQUEERAEED8QLlDcXwniCxBaTD9ARQHWbCICcAShVhehdFYZIG7y0IAlDxESDw4REQ4NERANDBESDAsREQsKERAKCRESCQgREQgHERAHBhESBgUREQUEERAEclYZBQIRFwIBERcBVhwBERjbPBC+EK0QnBCLEHoQaRBYEEcQNkUTUEJQApSOtz9XFFcUVxQKERAKEJ8QjhB9EGxVVQUREwV1BAMCERMCcAIBERQBERXbPDY2EFwLEDpJhxA2VQLjDVC2oBBbEEoQaRBoEGcFBFBBAoo5OXARFCBu8tCAbyMIERUIBxEUBy1RfwcQVgUREgUEERoEAxEZAwIRGgIBERkBERrIVaDbPMknBBA7T7sQJBAjbW3bPDBCkAHkghByIQ06UAzLHxrLP1AIINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WUAYg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxZQBCDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFlj6AshYQwGgINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WWCBulTBwAcsBjh4g10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbiWPoCyEMTUEVEAG5aINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WWPoCIW6zlX8BygDMlHAyygDiyQHMyQHMABIQiRB4EGcFBgQEwo9NMNMfAYIQtQ0yRLry4IHTP4EBAdcAgQEB1wD6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIFEMwbBRVsyzbPF8DVTtxQTPbPH/gIIIQfbBDVbrjAiCCCifG6LpHTEhJAaT4Q/goEts8XHBZyHABywFzAcsBcAHLABLMzMn5AMhyAcsBcAHLABLKB8v/ydAg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCI+EJSEMcF8uEuZgH2MNMfAYIQfbBDVbry4IHTP/oA+gD6APpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgVFEMwbBU0VbPbPDBsIjIqwv+TKsFlkXDi8uEyKcL/kynBZZFw4vLhMijC/5MowWWRcOLy4TIQexBqEFkQSBA3QBYFBAN/SwR+jyow0x8Bggonxui68uCB0z8BMTDbPPgnbxCCCJiWgKFSwHBZcG1tbds8MH/gIIIQHxTY3rrjAiCCEEZBDO26S5BKTQKgMNMfAYIQHxTY3rry4IHTPwExVbDbPCLCAJMhwgCRcOLy4TMgbrPy4TRwISBu8tCAEN4QzRC8EKsQmiQQmhCJEHgGUXRQZgQF2zxsIXBSAn9LTAAS+EJSwMcF8uEtAQpwgEDbPFAEqo6VMNMfAYIQRkEM7bry4IHTPwEx2zx/4CCCEMz9muO6jyow0x8BghDM/ZrjuvLggdM/ATFUeHtUfZhUenkryFWg2zzJ+EIBcG3bPH/gIIIQL5QxKbpOUo9UAfQjwgCTIsIAkXDi8uEzIW6z8uE0ggCcQHD4NvhBbyQTXwNTAaGCEDuaygC88uEwAaGrASSBA+ipBCSBA+ipBFFhoVFWoSHCAJMmwgCRcOKTJcIAkXDikyDCAJFw4vLhMXAlIG7y0IAkpwMiDxETDw4REg4NERENDBEQDE8CsgsREwsKERIKCRERCQgREAgHERMHVhFRdQcGERIGVhUGBQQDERQDAhETAgERFNs8cPhCDRERDQwREAwQvxCuEJ0QjBB7EGoQWRBIEDdGE1BCgEDbPGwhcFICUFACOBA2XlBWEXAGVhLIVWDbPMkvUEQQJBAjbW3bPDBRkADwghDTWCb7UAjLHxbLP1AEINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WEssfAfoCASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFgH6AshYINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WyQHMAcaCEA1fAJJQDMsfGss/GIEBAc8AFoEBAc8AUAQg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbIUAMg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbLDxLLDxLLD1hTAHggbpUwcAHLAY4eINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8W4hKBAQHPAALIgQEBzwDJWMzJAcwD/o64MNMfAYIQL5QxKbry4IHTP4EBAdcA+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiEMwbBPgIIIQiLfgsbqOsjDTHwGCEIi34LG68uCB0z/6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIEmwS4CCCENPAkqRVVlcCsBDeEM4QvhCuEJ4QjhB+EG4QXhBOED4QLts8ED/IVTCCEEYLLphQBcsfE8s/gQEBzwCBAQHPAIEBAc8AyRC8EKsQmhCJEHgQZxBWEEUQNEEw+EIBcG3bPH9ijwK4EM0QvRCtHRkYFxYVFEMw2zwdyFmCEMq7pP5QA8sfyz8BINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WyRC8EKsQmhCJEHgQZxBWEEUQNEEw+EIBcG3bPH9ljwT8uo9pMNMfAYIQ08CSpLry4IHTP4EBAdcAgQEB1wBVIGwTEN4QzhC+EK4QnhCOEH4QbhBeEE4QPhAu2zwdyFmCECRA65ZQA8sfyz+BAQHPAMkQvBCrEJoQiRB4EGcQVhBFEDRBMPhCAXBt2zx/4CCCEDW0A9y64wKCEEyIkDS6f49YWQLEMNMfAYIQNbQD3Lry4IHTP4EBAdcAWWwSEM0QvRCtHRkYFxYVFEMw2zwQLshVIIIQNEBGd1AEyx8Syz+BAQHPAIEBAc8AyRC8EKsQmhCJEHgQZxBWEEUQNEEw+EIBcG3bPH9qjwFsjrHTHwGCEEyIkDS68uCB0z/6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIEmwS4DBwWgK4EM0QvRCtHRkYFxYVFEMw2zwdyFmCECEciIhQA8sfyz8BINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WyRC8EKsQmhCJEHgQZxBWEEUQNEEw+EIBcG3bPH93jwH2UMsg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxZQCSDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFlAHINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WUAX6AshQBPoCWPoCyw8Syw8Syw9Y+gJQA/oCXABaASBulTBwAcsBjh4g10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbiyQHMAgEgXmsCASBfaQIBIGBnAgEgYWQCTbP2iDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjbPFUb2zxsw4HpiAloqgQPovPLhM1PAxwWOijBwVDGYVHmH2zzgUrDHBY6JcFQxiVR5h9s84DBwUwBjYwCScFMAMoEnEFAFoReoUgWoBYEnEKhQBKAUqQQjwgCZMVIDqIEnEKkEkTPiBJMgwgCRcOKaMlICqIEnEKkEAZEw4lMhoKFwAbYJWQJNsoUINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiNs8VQvbPGzBgemUBkPhD+CgS2zxwWchwAcsBcwHLAXABywASzMzJ+QDIcgHLAXABywASygfL/8nQINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiGYA2gLQ9AQwbQGCAPFMAYAQ9A9vofLghwGCAPFMIgKAEPQXyAHI9ADJAcxwAcoAQANZINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFskCJ7Zi22ebZ4dnZ2dnZ2dnZ2dnjYNQemgAFlR3aFR9yFR6llO6AhW7q/2zxVC9s8bMKHpqAD4gwgDy4TFTCKgqqQRRGKgqqQQhwgCTIMIAkXDi8uExAgEgbIECASBteQIBIG52AhGxZPbPNs8bMWB6bwRk+EP4KPgo2zwwyHAByx9vAAFvjG1vjI0E2h0dHBzOi8vbHAuc3Rvbi5maS+DbPPgo2zx4dXB0Akj6RMiLERjPFgKDB6CpOAdYywfL/8nQINs8yFjPFgHPFsnQ2zxxcgCYyAHPFosgAAjPFsnQcJQhxwGzjioB0weDBpMgwgCOGwOqAFMjsJGk3gOrACOED7yZA4QPsIEQIbID3ugwMQHoMYMHqQwByMsHywfJ0AGgjRAQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODktX4MiVItdJwheK6GwhydBzAJoC0wfTB9MHA6oPAqoHErEBsSCrEYA/sKoCUjB41yQUzxYjqwuAP7CqAlIweNckzxYjqwWAP7CqAlIweNckzxYDgD+wqgJSIHjXJBPPFgJE2zyLUuanNvbo2zx/AW8iAcmTIW6zlgFvIlnMyegxK1RPBHV1ALog10oh10mXIMIAIsIAsY5KA28igH8izzGrAqEFqwJRVbYIIMIAnCCqAhXXGFAzzxZAFN5ZbwJTQaHCAJnIAW8CUEShqgKOEjEzwgCZ1DDQINdKIddJknAg4uLoXwMCTbDeSDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjbPFUL2zxswYHp3AZD4Q/goEts8cFnIcAHLAXMBywFwAcsAEszMyfkAyHIBywFwAcsAEsoHy//J0CDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4Ih4ANYC0PQEMG0BgVp4AYAQ9A9vofLghwGBWngiAoAQ9BfIAcj0AMkBzHABygBAA1kg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxYBINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WyQIVtntbZ4qje2eNmDB6fwI47UTQ1AH4Y9IAAY6E2zxsHOD4KNcLCoMJuvLgiXt9Aeb6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAH6ANQB0PoA+gDTD9MP0w/6APoAfABsINcLAcMAjh/6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIlHLXIW3iMRCMEIsQihCJAcz6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiEMwA9FY2zx+ABRwUwCAFHpUcCJtATYqwACOh6jbPIED6KHgURqoKakEURqoKKkEtgiAAD4gwACSMHDgICDyhbYDpasArneWXKkEoKsA5GapBLYIABG4K+7UTQ0gABgBBb+KZIMBFP8A9KQT9LzyyAuEAgFihZMDetAB0NMDAXGwowH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIVFBTA28E+GEC+GLbPFUT2zzy4IKWhpIE7AGSMH/gcCHXScIflTAg1wsf3iCCEOja2K26jsQw0x8BghDo2tituvLggdM/+gD6APoAVTBsFPhCUlDHBfLhNVByoFBWoCTCAJ4lgQPovJUggQPovJFw4pFw4pI0MOMNf+AgghAwnn8iuuMCIIIQM6i/0rrjAiCHiImLAb4BcIMGVBc1fwjIVUCCEJp17exQBssfFMs/EoEBAc8AgQEBzwABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WAciBAQHPAMkBzMkiBBA2UFUUQzBtbds8MHBmA5AB+DDTHwGCEDCefyK68uCB0z8BMVRyFCbIVUCCELORJmtQBssfFMs/WCDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFgEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxaBAQHPAAHIgQEBzwDJAczJ+EIBf23bPH+PASQw0x8BghAzqL/SuvLggdM/ATGKAfT4QW8kE18D+EJSQMcF8uE2JcIAkX+TJMIA4vLhM4IQCPDRgL7y4T5wgEBQJn9RZchVMIIQtQ0yRFAFyx8Tyz+BAQHPAIEBAc8AASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFskiQxRGVRRDMG1t2zwwcGYDf5AD+oIQYO9S6LqOnTDTHwGCEGDvUui68uCB0z/6APoA+gBVMGwU2zx/4CCCEJG76Rq6jsAw0x8BghCRu+kauvLggdM/ATEw+EJSIMcF8uE2+CdvEIIImJaAvPLhMPgnbxCCCJiWgKFSIHB/VSBtbW3bPDB/4IIQlGqYtrrjAjBwjJCOAZz4QW8kE18D+EJScMcF8uE2IcIAniOBA+i8lSKBA+i8kXDikXDi8uExghAI8NGAvvLhPlFyoVFhoSbC/5Mgwv+RcOLy4TMDcIBAVBQ3fwuNAabIVUCCEJp17exQBssfFMs/EoEBAc8AgQEBzwABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WAciBAQHPAMkBzMkkBFCIFEMwbW3bPDAQI5ABTtMfAYIQlGqYtrry4IHTPwExyAGCEK/5D1dYyx/LP8n4QgFwbds8f48BPG1tIm6zmVsgbvLQgG8iAZEy4hAkcAMEgEJQI9s8MJAByshxAcoBUAcBygBwAcoCUAUg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxZQA/oCcAHKaCNus5F/kyRus+KXMzMBcAHKAOMNIW6znH8BygABIG7y0IABzJUxcAHKAOLJAfsIkQCYfwHKAMhwAcoAcAHKACRus51/AcoABCBu8tCAUATMljQDcAHKAOIkbrOdfwHKAAQgbvLQgFAEzJY0A3ABygDicAHKAAJ/AcoAAslYzAC4yPhDAcx/AcoAVTBQNIEBAc8AgQEBzwABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WyFgg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbJAczJ7VQCAW6UlQARtFfdqJoaQAAwAhG2TXtnm2eNiJCWmQHU7UTQ1AH4Y9IAAY5SgQEB1wCBAQHXAPpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB1AHQ+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiDEUQzBsFOD4KNcLCoMJuvLgiZcBivpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiBIC0QHbPJgACHBSAhMACFRxAyVeE95D',
  )
  let builder = beginCell()
  builder.storeRef(__system)
  builder.storeUint(0, 1)
  initPool_init_args({ $$type: 'Pool_init_args', router, token0Address, token1Address })(builder)
  const __data = builder.endCell()
  return { code: __code, data: __data }
}

const Pool_errors: { [key: number]: { message: string } } = {
  2: { message: `Stack underflow` },
  3: { message: `Stack overflow` },
  4: { message: `Integer overflow` },
  5: { message: `Integer out of expected range` },
  6: { message: `Invalid opcode` },
  7: { message: `Type check error` },
  8: { message: `Cell overflow` },
  9: { message: `Cell underflow` },
  10: { message: `Dictionary error` },
  11: { message: `'Unknown' error` },
  12: { message: `Fatal error` },
  13: { message: `Out of gas error` },
  14: { message: `Virtualization error` },
  32: { message: `Action list is invalid` },
  33: { message: `Action list is too long` },
  34: { message: `Action is invalid or not supported` },
  35: { message: `Invalid source address in outbound message` },
  36: { message: `Invalid destination address in outbound message` },
  37: { message: `Not enough TON` },
  38: { message: `Not enough extra-currencies` },
  39: { message: `Outbound message does not fit into a cell after rewriting` },
  40: { message: `Cannot process a message` },
  41: { message: `Library reference is null` },
  42: { message: `Library change action error` },
  43: { message: `Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree` },
  50: { message: `Account state size exceeded limits` },
  128: { message: `Null reference exception` },
  129: { message: `Invalid serialization prefix` },
  130: { message: `Invalid incoming message` },
  131: { message: `Constraints error` },
  132: { message: `Access denied` },
  133: { message: `Contract stopped` },
  134: { message: `Invalid argument` },
  135: { message: `Code of a contract was not found` },
  136: { message: `Invalid address` },
  137: { message: `Masterchain support is not enabled for this contract` },
}

const Pool_types: ABIType[] = [
  {
    name: 'StateInit',
    header: null,
    fields: [
      { name: 'code', type: { kind: 'simple', type: 'cell', optional: false } },
      { name: 'data', type: { kind: 'simple', type: 'cell', optional: false } },
    ],
  },
  {
    name: 'StdAddress',
    header: null,
    fields: [
      { name: 'workchain', type: { kind: 'simple', type: 'int', optional: false, format: 8 } },
      { name: 'address', type: { kind: 'simple', type: 'uint', optional: false, format: 256 } },
    ],
  },
  {
    name: 'VarAddress',
    header: null,
    fields: [
      { name: 'workchain', type: { kind: 'simple', type: 'int', optional: false, format: 32 } },
      { name: 'address', type: { kind: 'simple', type: 'slice', optional: false } },
    ],
  },
  {
    name: 'Context',
    header: null,
    fields: [
      { name: 'bounced', type: { kind: 'simple', type: 'bool', optional: false } },
      { name: 'sender', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'value', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'raw', type: { kind: 'simple', type: 'slice', optional: false } },
    ],
  },
  {
    name: 'SendParameters',
    header: null,
    fields: [
      { name: 'bounce', type: { kind: 'simple', type: 'bool', optional: false } },
      { name: 'to', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'value', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'mode', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'body', type: { kind: 'simple', type: 'cell', optional: true } },
      { name: 'code', type: { kind: 'simple', type: 'cell', optional: true } },
      { name: 'data', type: { kind: 'simple', type: 'cell', optional: true } },
    ],
  },
  {
    name: 'Deploy',
    header: 2490013878,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'DeployOk',
    header: 2952335191,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'FactoryDeploy',
    header: 1829761339,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'cashback', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'PayTo',
    header: 3545769723,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'owner', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'exitCode', type: { kind: 'simple', type: 'uint', optional: false, format: 32 } },
      { name: 'amount0Out', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'token0Address', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'amount1Out', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'token1Address', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'SetFees',
    header: 3128916783,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'newLpFee', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'newProtocolFee', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'newRefFee', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'newProtocolFeeAddress', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'jettonWallet0', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'jettonWallet1', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'CollectFees',
    header: 3697015726,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'jettonWallet0', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'jettonWallet1', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'Lock',
    header: 2103081517,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'Unlock',
    header: 2018129546,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'RouterResetGas',
    header: 3005576342,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'ResetPoolGas',
    header: 2667682037,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'jettonWallet0', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'jettonWallet1', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'GetterPoolAddress',
    header: 356176588,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'token0', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'token1', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'PoolAddress',
    header: 832067646,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'poolAddress', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'InitCodeUpgrade',
    header: 316241174,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'code', type: { kind: 'simple', type: 'cell', optional: false } },
    ],
  },
  {
    name: 'InitAdminUpgrade',
    header: 2151328254,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'admin', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'CancelAdminUpgrade',
    header: 3445886299,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'CancelCodeUpgrade',
    header: 3663952823,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'FinalizeUpgrades',
    header: 3373754125,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'Swap',
    header: 3827326903,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'fromUserAddress', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'tokenWallet', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'amount', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'minOut', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'fromRealUser', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'refAddress', type: { kind: 'simple', type: 'address', optional: true } },
      { name: 'refMessageValue', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'next', type: { kind: 'simple', type: 'SwapNext', optional: true } },
    ],
  },
  {
    name: 'CbSwap',
    header: 1914768698,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'fromUserAddress', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'sourceTokenWallet', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'tokenWallet', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'amount', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'fromRealUser', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'refAddress', type: { kind: 'simple', type: 'address', optional: true } },
      { name: 'refMessageValue', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'next', type: { kind: 'simple', type: 'SwapNext', optional: false } },
    ],
  },
  {
    name: 'SwapNext',
    header: null,
    fields: [
      { name: 'tokenAddress', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'minOut', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'next', type: { kind: 'simple', type: 'cell', optional: true } },
    ],
  },
  {
    name: 'ProvideLpOnSingleSide',
    header: 3370913140,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'ownerAddress', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'minLpOut', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'amount0', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'amount1', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
    ],
  },
  {
    name: 'SetFeesFromRouter',
    header: 2108703573,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'newLpFee', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'newProtocolFee', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'newRefFee', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'newProtocolFeeAddress', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'CollectFeesFromRouter',
    header: 521459934,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'CollectFeesFromAnyone',
    header: 1178668269,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'ResetPoolGasFromRouter',
    header: 36161256,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'CbRefundMe',
    header: 3037540932,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'amount0', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'amount1', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'userAddress', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'CbAddLiquidity',
    header: 2591419884,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'amount0', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'amount1', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'userAddress', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'minLpOut', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
    ],
  },
  {
    name: 'GetterPoolData',
    header: 3439172323,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'GetterPoolDataResponse',
    header: 224329874,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'reserve0', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'reserve1', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'token0Address', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'token1Address', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'lpFee', type: { kind: 'simple', type: 'uint', optional: false, format: 16 } },
      { name: 'protocolFee', type: { kind: 'simple', type: 'uint', optional: false, format: 16 } },
      { name: 'refFee', type: { kind: 'simple', type: 'uint', optional: false, format: 16 } },
      { name: 'protocolFeeAddress', type: { kind: 'simple', type: 'address', optional: true } },
      { name: 'collectedToken0ProtocolFee', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'collectedToken1ProtocolFee', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
    ],
  },
  {
    name: 'GetterExpectedOutputs',
    header: 798241065,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'amount', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'tokenWallet', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'GetterExpectedOutputsResponse',
    header: 1175137944,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'amountOut', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'protocolFeeOut', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'refFeeOut', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
    ],
  },
  {
    name: 'GetterLpAccountAddress',
    header: 2293751985,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'userAddress', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'GetterLpAccountAddressResponse',
    header: 3401295102,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'accountAddress', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'GetterExpectedTokens',
    header: 3552613028,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'amount0', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'amount1', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
    ],
  },
  {
    name: 'GetterExpectedTokensResponse',
    header: 608234390,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'liquidity', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
    ],
  },
  {
    name: 'GetterExpectedLiquidity',
    header: 900989916,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'liquidity', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
    ],
  },
  {
    name: 'GetterExpectedLiquidityResponse',
    header: 876627575,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'amount0', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'amount1', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
    ],
  },
  {
    name: 'ProvideWalletAddress',
    header: 1284018228,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'owner', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'ProvideWalletAddressResponse',
    header: 555518088,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'wallet', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'JettonWalletData',
    header: null,
    fields: [
      { name: 'balance', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'owner', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'master', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'code', type: { kind: 'simple', type: 'cell', optional: false } },
    ],
  },
  {
    name: 'TokenTransfer',
    header: 260734629,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'amount', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'destination', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'responseDestination', type: { kind: 'simple', type: 'address', optional: true } },
      { name: 'customPayload', type: { kind: 'simple', type: 'cell', optional: true } },
      { name: 'forwardTonAmount', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'forwardPayload', type: { kind: 'simple', type: 'cell', optional: true } },
    ],
  },
  {
    name: 'TokenTransferInternal',
    header: 395134233,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'amount', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'from', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'responseDestination', type: { kind: 'simple', type: 'address', optional: true } },
      { name: 'forwardTonAmount', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'forwardPayload', type: { kind: 'simple', type: 'cell', optional: true } },
    ],
  },
  {
    name: 'TokenNotification',
    header: 1935855772,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'amount', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'from', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'forwardPayload', type: { kind: 'simple', type: 'cell', optional: true } },
    ],
  },
  {
    name: 'TokenBurn',
    header: 1499400124,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'amount', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'responseDestination', type: { kind: 'simple', type: 'address', optional: true } },
      { name: 'customPayload', type: { kind: 'simple', type: 'cell', optional: true } },
    ],
  },
  {
    name: 'TokenBurnNotification',
    header: 2078119902,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'amount', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'sender', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'responseDestination', type: { kind: 'simple', type: 'address', optional: true } },
      { name: 'token0MinOut', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'token1MinOut', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
    ],
  },
  {
    name: 'TokenExcesses',
    header: 3576854235,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'TokenUpdateContent',
    header: 2937889386,
    fields: [{ name: 'content', type: { kind: 'simple', type: 'cell', optional: false } }],
  },
  {
    name: 'TakeWalletAddress',
    header: 3513996288,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'walletAddress', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'ownerAddress', type: { kind: 'simple', type: 'slice', optional: false, format: 'remainder' } },
    ],
  },
  {
    name: 'Pool$Data',
    header: null,
    fields: [
      { name: 'router', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'token0Address', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'token1Address', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'totalSupply', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'reserve0', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'reserve1', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'lpFee', type: { kind: 'simple', type: 'uint', optional: false, format: 16 } },
      { name: 'protocolFee', type: { kind: 'simple', type: 'uint', optional: false, format: 16 } },
      { name: 'refFee', type: { kind: 'simple', type: 'uint', optional: false, format: 16 } },
      { name: 'collectedToken0ProtocolFee', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'collectedToken1ProtocolFee', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'protocolFeeAddress', type: { kind: 'simple', type: 'address', optional: true } },
    ],
  },
  {
    name: 'AmountOut',
    header: null,
    fields: [
      { name: 'swapOut', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'protocolFeeOut', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'refFeeOut', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
    ],
  },
  {
    name: 'PoolData',
    header: null,
    fields: [
      { name: 'reserve0', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'reserve1', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'totalSupply', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'token0Address', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'token1Address', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'lpFee', type: { kind: 'simple', type: 'uint', optional: false, format: 16 } },
      { name: 'protocolFee', type: { kind: 'simple', type: 'uint', optional: false, format: 16 } },
      { name: 'refFee', type: { kind: 'simple', type: 'uint', optional: false, format: 16 } },
      { name: 'protocolFeeAddress', type: { kind: 'simple', type: 'address', optional: true } },
      { name: 'collectedToken0ProtocolFee', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'collectedToken1ProtocolFee', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
    ],
  },
  {
    name: 'ExpectedOutputs',
    header: null,
    fields: [
      { name: 'amountOut', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'protocolFeeOut', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'refFeeOut', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
    ],
  },
  {
    name: 'ExpectedLiquidityOutputs',
    header: null,
    fields: [
      { name: 'amount0', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'amount1', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
    ],
  },
  {
    name: 'JettonData',
    header: null,
    fields: [
      { name: 'totalSupply', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'mintable', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'adminAddress', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'jettonContent', type: { kind: 'simple', type: 'cell', optional: false } },
      { name: 'jettonWalletCode', type: { kind: 'simple', type: 'cell', optional: false } },
    ],
  },
  {
    name: 'GetterLPAccountData',
    header: null,
    fields: [
      { name: 'userAddress', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'poolAddress', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'amount0', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'amount1', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
    ],
  },
  {
    name: 'LpAccount$Data',
    header: null,
    fields: [
      { name: 'amount0', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'amount1', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'userAddress', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'poolAddress', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'LpWallet$Data',
    header: null,
    fields: [
      { name: 'balance', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'owner', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'master', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'StateInitWithAddress',
    header: null,
    fields: [
      { name: 'stateInit', type: { kind: 'simple', type: 'StateInit', optional: false } },
      { name: 'address', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
  {
    name: 'AddLiquidity',
    header: 3906656429,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'newAmount0', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'newAmount1', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'minLPOut', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
    ],
  },
  {
    name: 'LPAccountData',
    header: 815693602,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'LPAccountDataResponse',
    header: 3012634219,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'userAddress', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'poolAddress', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'amount0', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'amount1', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
    ],
  },
  {
    name: 'RefundMe',
    header: 866697170,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'DirectAddLiquidity',
    header: 1626297064,
    fields: [
      { name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'amount0', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'amount1', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
      { name: 'minLPOut', type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' } },
    ],
  },
  {
    name: 'ResetGas',
    header: 2445011226,
    fields: [{ name: 'queryId', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } }],
  },
  {
    name: 'Upgrade',
    header: null,
    fields: [
      { name: 'endCode', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'endAdmin', type: { kind: 'simple', type: 'uint', optional: false, format: 64 } },
      { name: 'admin', type: { kind: 'simple', type: 'address', optional: true } },
      { name: 'adminConfirmed', type: { kind: 'simple', type: 'bool', optional: false } },
      { name: 'code', type: { kind: 'simple', type: 'cell', optional: true } },
    ],
  },
  {
    name: 'RouterData',
    header: null,
    fields: [
      { name: 'locked', type: { kind: 'simple', type: 'bool', optional: false } },
      { name: 'adminAddress', type: { kind: 'simple', type: 'address', optional: false } },
      { name: 'tempUpgrade', type: { kind: 'simple', type: 'Upgrade', optional: false } },
    ],
  },
  {
    name: 'Router$Data',
    header: null,
    fields: [
      { name: 'tempUpgrade', type: { kind: 'simple', type: 'Upgrade', optional: false } },
      { name: 'locked', type: { kind: 'simple', type: 'bool', optional: false } },
      { name: 'adminAddress', type: { kind: 'simple', type: 'address', optional: false } },
    ],
  },
]

const Pool_getters: ABIGetter[] = [
  { name: 'getPoolData', arguments: [], returnType: { kind: 'simple', type: 'PoolData', optional: false } },
  {
    name: 'getExpectedOutputs',
    arguments: [
      { name: 'amountIn', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'tokenWallet', type: { kind: 'simple', type: 'address', optional: false } },
    ],
    returnType: { kind: 'simple', type: 'ExpectedOutputs', optional: false },
  },
  {
    name: 'getExpectedTokens',
    arguments: [
      { name: 'amount0', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
      { name: 'amount1', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
    ],
    returnType: { kind: 'simple', type: 'int', optional: false, format: 257 },
  },
  {
    name: 'getExpectedLiquidity',
    arguments: [{ name: 'liquidity', type: { kind: 'simple', type: 'int', optional: false, format: 257 } }],
    returnType: { kind: 'simple', type: 'ExpectedLiquidityOutputs', optional: false },
  },
  {
    name: 'getLpAccountAddress',
    arguments: [{ name: 'owner', type: { kind: 'simple', type: 'address', optional: false } }],
    returnType: { kind: 'simple', type: 'address', optional: false },
  },
  { name: 'getJettonData', arguments: [], returnType: { kind: 'simple', type: 'JettonData', optional: false } },
  {
    name: 'get_wallet_address',
    arguments: [{ name: 'owner', type: { kind: 'simple', type: 'address', optional: false } }],
    returnType: { kind: 'simple', type: 'address', optional: false },
  },
]

export const Pool_getterMapping: { [key: string]: string } = {
  getPoolData: 'getGetPoolData',
  getExpectedOutputs: 'getGetExpectedOutputs',
  getExpectedTokens: 'getGetExpectedTokens',
  getExpectedLiquidity: 'getGetExpectedLiquidity',
  getLpAccountAddress: 'getGetLpAccountAddress',
  getJettonData: 'getGetJettonData',
  get_wallet_address: 'getGetWalletAddress',
}

const Pool_receivers: ABIReceiver[] = [
  { receiver: 'internal', message: { kind: 'empty' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'Deploy' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'ProvideLpOnSingleSide' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'CbAddLiquidity' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'TokenBurnNotification' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'Swap' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'CbRefundMe' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'SetFeesFromRouter' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'ResetPoolGasFromRouter' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'CollectFeesFromRouter' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'CollectFeesFromAnyone' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'GetterPoolData' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'GetterExpectedOutputs' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'GetterLpAccountAddress' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'GetterExpectedTokens' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'GetterExpectedLiquidity' } },
  { receiver: 'internal', message: { kind: 'typed', type: 'ProvideWalletAddress' } },
]

export class Pool implements Contract {
  static async init(router: Address, token0Address: Address, token1Address: Address) {
    return await Pool_init(router, token0Address, token1Address)
  }

  static async fromInit(router: Address, token0Address: Address, token1Address: Address) {
    const init = await Pool_init(router, token0Address, token1Address)
    const address = contractAddress(0, init)
    return new Pool(address, init)
  }

  static fromAddress(address: Address) {
    return new Pool(address)
  }

  readonly address: Address
  readonly init?: { code: Cell; data: Cell }
  readonly abi: ContractABI = {
    types: Pool_types,
    getters: Pool_getters,
    receivers: Pool_receivers,
    errors: Pool_errors,
  }

  private constructor(address: Address, init?: { code: Cell; data: Cell }) {
    this.address = address
    this.init = init
  }

  async send(
    provider: ContractProvider,
    via: Sender,
    args: { value: bigint; bounce?: boolean | null | undefined },
    message:
      | null
      | Deploy
      | ProvideLpOnSingleSide
      | CbAddLiquidity
      | TokenBurnNotification
      | Swap
      | CbRefundMe
      | SetFeesFromRouter
      | ResetPoolGasFromRouter
      | CollectFeesFromRouter
      | CollectFeesFromAnyone
      | GetterPoolData
      | GetterExpectedOutputs
      | GetterLpAccountAddress
      | GetterExpectedTokens
      | GetterExpectedLiquidity
      | ProvideWalletAddress,
  ) {
    let body: Cell | null = null
    if (message === null) {
      body = new Cell()
    }
    if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
      body = beginCell().store(storeDeploy(message)).endCell()
    }
    if (
      message &&
      typeof message === 'object' &&
      !(message instanceof Slice) &&
      message.$$type === 'ProvideLpOnSingleSide'
    ) {
      body = beginCell().store(storeProvideLpOnSingleSide(message)).endCell()
    }
    if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CbAddLiquidity') {
      body = beginCell().store(storeCbAddLiquidity(message)).endCell()
    }
    if (
      message &&
      typeof message === 'object' &&
      !(message instanceof Slice) &&
      message.$$type === 'TokenBurnNotification'
    ) {
      body = beginCell().store(storeTokenBurnNotification(message)).endCell()
    }
    if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Swap') {
      body = beginCell().store(storeSwap(message)).endCell()
    }
    if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CbRefundMe') {
      body = beginCell().store(storeCbRefundMe(message)).endCell()
    }
    if (
      message &&
      typeof message === 'object' &&
      !(message instanceof Slice) &&
      message.$$type === 'SetFeesFromRouter'
    ) {
      body = beginCell().store(storeSetFeesFromRouter(message)).endCell()
    }
    if (
      message &&
      typeof message === 'object' &&
      !(message instanceof Slice) &&
      message.$$type === 'ResetPoolGasFromRouter'
    ) {
      body = beginCell().store(storeResetPoolGasFromRouter(message)).endCell()
    }
    if (
      message &&
      typeof message === 'object' &&
      !(message instanceof Slice) &&
      message.$$type === 'CollectFeesFromRouter'
    ) {
      body = beginCell().store(storeCollectFeesFromRouter(message)).endCell()
    }
    if (
      message &&
      typeof message === 'object' &&
      !(message instanceof Slice) &&
      message.$$type === 'CollectFeesFromAnyone'
    ) {
      body = beginCell().store(storeCollectFeesFromAnyone(message)).endCell()
    }
    if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'GetterPoolData') {
      body = beginCell().store(storeGetterPoolData(message)).endCell()
    }
    if (
      message &&
      typeof message === 'object' &&
      !(message instanceof Slice) &&
      message.$$type === 'GetterExpectedOutputs'
    ) {
      body = beginCell().store(storeGetterExpectedOutputs(message)).endCell()
    }
    if (
      message &&
      typeof message === 'object' &&
      !(message instanceof Slice) &&
      message.$$type === 'GetterLpAccountAddress'
    ) {
      body = beginCell().store(storeGetterLpAccountAddress(message)).endCell()
    }
    if (
      message &&
      typeof message === 'object' &&
      !(message instanceof Slice) &&
      message.$$type === 'GetterExpectedTokens'
    ) {
      body = beginCell().store(storeGetterExpectedTokens(message)).endCell()
    }
    if (
      message &&
      typeof message === 'object' &&
      !(message instanceof Slice) &&
      message.$$type === 'GetterExpectedLiquidity'
    ) {
      body = beginCell().store(storeGetterExpectedLiquidity(message)).endCell()
    }
    if (
      message &&
      typeof message === 'object' &&
      !(message instanceof Slice) &&
      message.$$type === 'ProvideWalletAddress'
    ) {
      body = beginCell().store(storeProvideWalletAddress(message)).endCell()
    }
    if (body === null) {
      throw new Error('Invalid message type')
    }

    await provider.internal(via, { ...args, body: body })
  }

  async getGetPoolData(provider: ContractProvider) {
    let builder = new TupleBuilder()
    let source = (await provider.get('getPoolData', builder.build())).stack
    const result = loadGetterTuplePoolData(source)
    return result
  }

  async getGetExpectedOutputs(provider: ContractProvider, amountIn: bigint, tokenWallet: Address) {
    let builder = new TupleBuilder()
    builder.writeNumber(amountIn)
    builder.writeAddress(tokenWallet)
    let source = (await provider.get('getExpectedOutputs', builder.build())).stack
    const result = loadGetterTupleExpectedOutputs(source)
    return result
  }

  async getGetExpectedTokens(provider: ContractProvider, amount0: bigint, amount1: bigint) {
    let builder = new TupleBuilder()
    builder.writeNumber(amount0)
    builder.writeNumber(amount1)
    let source = (await provider.get('getExpectedTokens', builder.build())).stack
    let result = source.readBigNumber()
    return result
  }

  async getGetExpectedLiquidity(provider: ContractProvider, liquidity: bigint) {
    let builder = new TupleBuilder()
    builder.writeNumber(liquidity)
    let source = (await provider.get('getExpectedLiquidity', builder.build())).stack
    const result = loadGetterTupleExpectedLiquidityOutputs(source)
    return result
  }

  async getGetLpAccountAddress(provider: ContractProvider, owner: Address) {
    let builder = new TupleBuilder()
    builder.writeAddress(owner)
    let source = (await provider.get('getLpAccountAddress', builder.build())).stack
    let result = source.readAddress()
    return result
  }

  async getGetJettonData(provider: ContractProvider) {
    let builder = new TupleBuilder()
    let source = (await provider.get('getJettonData', builder.build())).stack
    const result = loadGetterTupleJettonData(source)
    return result
  }

  async getGetWalletAddress(provider: ContractProvider, owner: Address) {
    let builder = new TupleBuilder()
    builder.writeAddress(owner)
    let source = (await provider.get('get_wallet_address', builder.build())).stack
    let result = source.readAddress()
    return result
  }
}
