import { Box, Button, FlexGap, Select, Text } from '@pancakeswap/uikit'
import { beginCell, fromNano, toNano } from '@ton/core'
import { SendTransactionRequest, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { fetchListAtom } from 'atoms/lists/fetchListAtom'
import { Header } from 'components/Header'
import Container from 'components/Layout/Container'
import { useAtomValue } from 'jotai'
import { useCallback, useState } from 'react'
import { TonContext } from 'ton/context/TonContext'
import { Contracts } from 'ton/def/contracts.def'
import { useAddLiquidity } from 'ton/logic/liquidity/useAddLiquidity'
import { useSwap } from 'ton/logic/swap/useSwap'
import { TonContractNames } from 'ton/ton.enums'
import { parseAddress } from 'ton/utils/address'
import { JettonMasterUSDT } from 'ton/wrappers/tact_JettonMasterUSDT'
import { JettonWalletUSDT } from 'ton/wrappers/tact_JettonWalletUSDT'
import { Router } from 'ton/wrappers/tact_Router'

export default function TestMint() {
  const { data: activeList } = useAtomValue(fetchListAtom)
  const tokens = activeList || []

  //   const [amount, setAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState(tokens[0] || undefined)

  const [resultMessage, setResultMessage] = useState('')

  const wallet = useTonWallet()
  const [tonUI] = useTonConnectUI()

  const { addLiquidity } = useAddLiquidity()
  const { swap } = useSwap()

  // useAtomValue(
  //   poolAddressAtom({
  //     token0Address: 'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F', // $SYRUP
  //     token1Address: 'kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg', // $P
  //   }),
  // )

  const handleMint = useCallback(() => {
    if (!selectedToken || !wallet?.account.address) throw new Error('Invalid input provided!')

    const body = beginCell()
      //   .store(
      //     storeJettonMintMessage({
      //       amount: toNano(amount),
      //       to: parseAddress(wallet?.account?.address),
      //       forwardPayload: null,
      //       forwardTonAmount: 0n,
      //       from: parseAddress(wallet.account.address),
      //       queryId: 1n,
      //       responseAddress: parseAddress(wallet.account.address),
      //       walletForwardValue: 0n,
      //     }),
      //   )

      .storeUint(0, 32)
      .storeStringTail('Mint:1')

      .endCell()

    const txRequest: SendTransactionRequest = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: selectedToken?.address,
          amount: toNano('1').toString(),
          payload: body.toBoc().toString('base64'),
        },
      ],
    }

    tonUI.sendTransaction(txRequest)
  }, [selectedToken, tonUI, wallet?.account.address])

  const estimateAddLiquidity = useCallback(async () => {
    if (!wallet?.account.address) throw new Error('Wallet not connected')
    const client = TonContext.instance.getClient()
    const contractAddress = parseAddress(Contracts[TonContractNames.PCSRouter].testnet.address)

    const router = client.open(Router.fromAddress(contractAddress))

    const result = await router.getEstimateAddLiquidity(1000000n)

    setResultMessage(`Estimated Fee: ${fromNano(result)}`)
  }, [wallet?.account.address])

  const readJetton = useCallback(async () => {
    if (!wallet?.account.address) throw new Error('Wallet not connected')

    const client = TonContext.instance.getClient()
    const contractAddress = parseAddress(Contracts[TonContractNames.USDC].testnet.address)
    const jettonMaster = client.open(JettonMasterUSDT.fromAddress(contractAddress))
    const jettonWalletAddress = await jettonMaster.getGetWalletAddress(parseAddress(wallet?.account.address))

    const jettonData = await jettonMaster.getGetJettonData()

    const jettonWallet = client.open(JettonWalletUSDT.fromAddress(jettonWalletAddress))
    const result = JSON.stringify(jettonWallet.getGetWalletData())

    console.log('Jetton result:', { jettonData, result })
    setResultMessage(`Jetton result:  ${jettonWalletAddress} ${result}`)
  }, [wallet?.account.address])

  const handleAddLiquidity = useCallback(() => {
    if (!wallet || !wallet?.account.address) throw new Error('Wallet not connected')

    addLiquidity({
      amount0: toNano(100),
      amount1: toNano(100),
      token0Address: 'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F', // $SYRUP
      token1Address: 'kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg', // $PAN
    })
  }, [wallet, addLiquidity])

  const handleSwap = useCallback(() => {
    if (!wallet || !wallet?.account.address) throw new Error('Wallet not connected')

    swap({
      amount0: BigInt('100'),
      minOut: 1n,
      token0Address: 'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F', // $SYRUP
      token1Address: 'kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg', // $PAN
    })
  }, [wallet, swap])

  const getPoolAddress = useCallback(async () => {
    const client = TonContext.instance.getClient()
    const routerAddress = parseAddress(Contracts[TonContractNames.PCSRouter].testnet.address)
    const router = client.open(Router.fromAddress(routerAddress))

    const token0Address = parseAddress('kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F') // $SYRUP
    const token1Address = parseAddress('kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg') // $PAN

    const jetton0 = client.open(JettonMasterUSDT.fromAddress(token0Address))
    const jetton1 = client.open(JettonMasterUSDT.fromAddress(token1Address))

    const [routerJettonWallet0, routerJettonWallet1] = await Promise.all([
      jetton0.getGetWalletAddress(routerAddress),
      jetton1.getGetWalletAddress(routerAddress),
    ])

    const poolAddress = await router.getGetPoolAddress(routerJettonWallet0, routerJettonWallet1)

    setResultMessage(`Pool Address: ${poolAddress.toString()}`)
  }, [])

  return (
    <>
      <Header />
      <Container mt="40px">
        <Text fontSize="36px" bold>
          Mint Test Tokens
        </Text>
        <Text>To be minted: 100</Text>
        <FlexGap mt="20px" flexDirection={['column', 'column', 'row']} gap="8px">
          <Select
            options={tokens.map((token) => ({ label: token.symbol, value: token.address }))}
            onOptionChange={(option) => {
              const token = tokens.find((t) => t.address === option.value)
              if (token) setSelectedToken(token)
            }}
            placeHolderText="Select Token"
          />
          {/* <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} /> */}
        </FlexGap>

        <Button mt="20px" onClick={handleMint} disabled={!selectedToken || !wallet?.account.address}>
          Mint
        </Button>
        <Box mt="20px">
          {wallet?.account ? (
            <>
              <Text bold>Wallet Connected</Text>
              <Text>{wallet?.account.address}</Text>
              <Text>Chain: {wallet?.account.chain}</Text>
            </>
          ) : (
            <b>Wallet not connected</b>
          )}
        </Box>

        <Box mt="20px">
          <Text fontSize="36px" bold>
            Test Contracts
          </Text>

          <Text bold>{resultMessage}</Text>

          <Text mt="16px" bold>
            Router
          </Text>
          <FlexGap gap="8px" flexWrap="wrap">
            <Button onClick={estimateAddLiquidity}>Read estimateAddLiquidity</Button>
            <Button onClick={getPoolAddress}>Read poolAddress of $SYRUP and $PAN</Button>
            <Button onClick={handleAddLiquidity}>Write addLiquidity</Button>
            <Button onClick={handleSwap}>Write Swap</Button>
          </FlexGap>

          <Text mt="16px" bold>
            Jetton
          </Text>
          <Button onClick={readJetton}>Read Jetton Wallet Address</Button>
        </Box>
      </Container>
    </>
  )
}
