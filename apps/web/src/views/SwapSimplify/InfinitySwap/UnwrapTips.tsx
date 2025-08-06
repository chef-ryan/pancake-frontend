import React, { useCallback } from 'react'
import { Button, Flex, InfoIcon, Text, useToast } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useWallet } from '@solana/wallet-adapter-react'
import { createCloseAccountInstruction } from '@solana/spl-token-0.4'
import { Transaction } from '@solana/web3.js'
import { useSolanaTokenBalance, useRefreshSolanaTokenBalances } from 'state/token/solanaTokenBalances'
import { useSolanaConnectionWithRpcAtom } from 'hooks/solana/useSolanaConnectionWithRpcAtom'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { NonEVMChainId } from '@pancakeswap/chains'
import { WSOLMint } from '@pancakeswap/sdk'
import { useSwapCurrency } from 'views/Swap/V3Swap/hooks/useSwapCurrency'

export const UnwrapTips: React.FC = () => {
  const { t } = useTranslation()
  const { publicKey, signTransaction } = useWallet()
  const connection = useSolanaConnectionWithRpcAtom()
  const { solanaAccount } = useAccountActiveChain()
  const { balance: wsolBalance } = useSolanaTokenBalance(solanaAccount, WSOLMint.toBase58())
  const refreshSolanaBalances = useRefreshSolanaTokenBalances(solanaAccount)
  const { toastSuccess, toastError } = useToast()
  const [inputCurrency, outputCurrency] = useSwapCurrency()

  const isSolanaSwap =
    inputCurrency?.chainId === NonEVMChainId.SOLANA || outputCurrency?.chainId === NonEVMChainId.SOLANA
  const showUnwrapTip = isSolanaSwap && wsolBalance.gt(0)

  const handleUnwrap = useCallback(async () => {
    try {
      if (!publicKey || !signTransaction) throw new Error('Wallet not connected')
      const accounts = await connection.getTokenAccountsByOwner(publicKey, { mint: WSOLMint })
      if (accounts.value.length === 0) return
      const tx = new Transaction()
      accounts.value.forEach(({ pubkey }) => {
        tx.add(createCloseAccountInstruction(pubkey, publicKey, publicKey))
      })
      tx.feePayer = publicKey
      const { blockhash } = await connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash
      const signed = await signTransaction(tx)
      const sig = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction(sig)
      toastSuccess(t('Success!'), t('Unwrapped WSOL to SOL'))
      refreshSolanaBalances()
    } catch (e: any) {
      toastError(t('Failed'), e?.message ?? 'Unwrap failed')
    }
  }, [publicKey, signTransaction, connection, toastSuccess, toastError, t, refreshSolanaBalances])

  if (!showUnwrapTip) return null

  return (
    <Flex mb="12px" alignItems="center" px="8px" py="8px" backgroundColor="rgba(0,0,0,0.05)" borderRadius="8px">
      <InfoIcon mr="4px" />
      <Text>
        {t('You have %amount% WSOL that you can ', { amount: wsolBalance.dividedBy(1e9).toFixed(6) })}
        <Button variant="textPrimary60" onClick={handleUnwrap}>
          {t('unwrap')}
        </Button>
      </Text>
    </Flex>
  )
}

export default UnwrapTips
