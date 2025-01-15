import { Box, Button, FlexGap, Select, Text } from '@pancakeswap/uikit'
import { storeJettonTransferMessage } from '@ton-community/assets-sdk'
import { Address, beginCell, fromNano, toNano } from '@ton/core'
import { SendTransactionRequest, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { fetchListAtom } from 'atoms/lists/fetchListAtom'
import { Header } from 'components/Header'
import Container from 'components/Layout/Container'
import { useAtomValue } from 'jotai'
import { useCallback, useState } from 'react'
import { TonContext } from 'ton/context/TonContext'
import { Contracts } from 'ton/def/contracts.def'
import { TON_OPCODES } from 'ton/opcodes'
import { TonContractNames } from 'ton/ton.enums'
import { JettonMasterUSDT } from 'ton/wrappers/tact_JettonMasterUSDT'
import { JettonWalletUSDT } from 'ton/wrappers/tact_JettonWalletUSDT'
import { Router } from 'ton/wrappers/tact_Router'

export default function TestMint() {
  const { data: activeList } = useAtomValue(fetchListAtom)
  const tokens = activeList?.tokens || []

  //   const [amount, setAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState(tokens[0] || undefined)

  const [resultMessage, setResultMessage] = useState('')

  const wallet = useTonWallet()
  const [tonUI] = useTonConnectUI()

  const handleMint = useCallback(() => {
    if (!selectedToken || !wallet?.account.address) throw new Error('Invalid input provided!')

    const body = beginCell()
      //   .store(
      //     storeJettonMintMessage({
      //       amount: toNano(amount),
      //       to: Address.parse(wallet?.account?.address),
      //       forwardPayload: null,
      //       forwardTonAmount: 0n,
      //       from: Address.parse(wallet.account.address),
      //       queryId: 1n,
      //       responseAddress: Address.parse(wallet.account.address),
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
    const contractAddress = Address.parse(Contracts[TonContractNames.PCSRouter].address)

    const router = client.open(Router.fromAddress(contractAddress))

    const result = await router.getEstimateAddLiquidity(1000000n)

    setResultMessage(`Estimated Fee: ${fromNano(result)}`)
  }, [wallet?.account.address])

  const readJetton = useCallback(async () => {
    if (!wallet?.account.address) throw new Error('Wallet not connected')

    const client = TonContext.instance.getClient()
    const contractAddress = Address.parse(Contracts[TonContractNames.USDC].address)
    const jettonMaster = client.open(JettonMasterUSDT.fromAddress(contractAddress))
    const jettonWalletAddress = await jettonMaster.getGetWalletAddress(Address.parse(wallet?.account.address))

    const jettonData = await jettonMaster.getGetJettonData()

    const jettonWallet = client.open(JettonWalletUSDT.fromAddress(jettonWalletAddress))
    const result = JSON.stringify(jettonWallet.getGetWalletData())

    console.log('Jetton result:', { jettonData, result })
    setResultMessage(`Jetton result:  ${jettonWalletAddress} ${result}`)
  }, [wallet?.account.address])

  const handleAddLiquidity = useCallback(async () => {
    if (!wallet || !wallet?.account.address) throw new Error('Wallet not connected')

    // For the testnet RPC ratelimit of 1 request per second
    const WAIT = () => new Promise((resolve) => setTimeout(resolve, 1000))

    const client = TonContext.instance.getClient()
    const routerAddress = Address.parse(Contracts[TonContractNames.PCSRouter].address)

    const walletAddress = Address.parse(wallet.account.address)
    const token0Address = Address.parse('kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F') // $SYRUP
    const token1Address = Address.parse('kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg') // $PAN

    const jettonMaster0 = client.open(JettonMasterUSDT.fromAddress(token0Address))
    const jettonMaster1 = client.open(JettonMasterUSDT.fromAddress(token1Address))

    const userJettonWallet0 = await jettonMaster0.getGetWalletAddress(walletAddress)

    await WAIT()

    const userJettonWallet1 = await jettonMaster1.getGetWalletAddress(walletAddress)

    await WAIT()

    const routerJettonWallet0 = await jettonMaster0.getGetWalletAddress(routerAddress)

    await WAIT()

    const routerJettonWallet1 = await jettonMaster1.getGetWalletAddress(routerAddress)

    await WAIT()

    const forwardPayload0 = beginCell()
      .storeUint(TON_OPCODES.ADD_LIQUIDITY, 32)
      .storeAddress(routerJettonWallet1)
      .storeCoins(toNano(900))
      .endCell()
    const payload0 = beginCell()
      .store(
        storeJettonTransferMessage({
          queryId: 1n,
          amount: toNano(1000),
          destination: routerAddress,
          responseDestination: walletAddress,
          customPayload: null,
          forwardAmount: toNano('0.1'),
          forwardPayload: forwardPayload0,
        }),
      )
      .endCell()

    const forwardPayload1 = beginCell()
      .storeUint(TON_OPCODES.ADD_LIQUIDITY, 32)
      .storeAddress(routerJettonWallet0)
      .storeCoins(toNano(900))
      .endCell()
    const payload1 = beginCell()
      .store(
        storeJettonTransferMessage({
          queryId: 2n,
          amount: toNano(1000),
          destination: routerAddress,
          responseDestination: walletAddress,
          customPayload: null,
          forwardAmount: toNano('0.1'),
          forwardPayload: forwardPayload1,
        }),
      )
      .endCell()

    const txRequest: SendTransactionRequest = {
      validUntil: Math.floor(Date.now() / 1000) + 60 * 2,
      messages: [
        {
          address: userJettonWallet0.toString(),
          amount: toNano('0.2').toString(),
          payload: payload0.toBoc().toString('base64'),
        },
        {
          address: userJettonWallet1.toString(),
          amount: toNano('0.2').toString(),
          payload: payload1.toBoc().toString('base64'),
        },
      ],
    }

    tonUI.sendTransaction(txRequest)
  }, [tonUI, wallet])

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
          <FlexGap gap="8px">
            <Button onClick={estimateAddLiquidity}>Read estimateAddLiquidity</Button>
            <Button onClick={handleAddLiquidity}>Write addLiquidity</Button>
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
