import { ChainId, getChainName } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token } from '@pancakeswap/sdk'
import { BalanceInput, Box, Button, CloseIcon, FlexGap, IconButton, Input, Text } from '@pancakeswap/uikit'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { ASSET_CDN } from 'config/constants/endpoints'
import { BalanceData } from 'hooks/useAddressBalance'
import { useERC20 } from 'hooks/useContract'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { formatUnits, zeroAddress } from 'viem'
import { useAccount, usePublicClient, useSendTransaction } from 'wagmi'
import { ActionButton } from './ActionButton'
import SendTransactionFlow from './SendTransactionFlow'

const FormContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const AssetContainer = styled(Box)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
`

const ChainIconWrapper = styled(Box)`
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
`

// No longer need these styled components since we're using CurrencyInputPanelSimplify

const AddressInputWrapper = styled(Box)`
  margin-bottom: 4px;
`

const ClearButton = styled(IconButton)`
  width: 20px;
  height: 20px;
`

const ErrorMessage = styled(Text)`
  color: ${({ theme }) => theme.colors.failure};
  font-size: 14px;
`

export interface SendAssetFormProps {
  asset: BalanceData
  onDismiss: () => void
}

export const SendAssetForm: React.FC<SendAssetFormProps> = ({ asset, onDismiss }) => {
  const { t } = useTranslation()
  const [address, setAddress] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [addressError, setAddressError] = useState('')
  const [activePercentage, setActivePercentage] = useState<number | null>(null)
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null)
  const [estimatedFeeUsd, setEstimatedFeeUsd] = useState<string | null>(null)

  // Transaction state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)
  const { address: accountAddress } = useAccount()
  const publicClient = usePublicClient({ chainId: asset.chainId })

  // Get native currency for fee calculation
  const nativeCurrency = useNativeCurrency(asset.chainId)
  const { data: nativeCurrencyPrice } = useCurrencyUsdPrice(nativeCurrency)
  const currency = useMemo(
    () =>
      new Token(
        asset.chainId,
        asset.token.address as `0x${string}`,
        asset.token.decimals,
        asset.token.symbol,
        asset.token.name,
      ),
    [asset],
  )
  const isNativeToken = asset.token.address === zeroAddress
  const erc20Contract = useERC20(asset.token.address as `0x${string}`, { chainId: asset.chainId })
  const { sendTransactionAsync } = useSendTransaction()

  const estimateTransactionFee = useCallback(async () => {
    if (!address || !amount || !publicClient || !accountAddress) return

    const amounts = tryParseAmount(amount, currency)

    try {
      let gasEstimate: bigint

      if (isNativeToken) {
        // Estimate gas for native token transfer
        gasEstimate = await publicClient.estimateGas({
          account: accountAddress,
          to: address as `0x${string}`,
          value: amounts?.quotient ?? 0n,
        })
      } else {
        // Estimate gas for ERC20 token transfer
        const transferData = {
          to: address as `0x${string}`,
          amount: amounts?.quotient ?? 0n,
        }
        gasEstimate =
          (await erc20Contract?.estimateGas?.transfer([transferData.to, transferData.amount], {
            account: erc20Contract.account!,
          })) ?? 0n
      }

      // Get gas price
      const gasPrice = await publicClient.getGasPrice()

      // Calculate fee
      const fee = gasEstimate * gasPrice

      // Convert to readable format (in native token units)
      const formattedFee = formatUnits(fee, 18)

      setEstimatedFee(formattedFee)

      // Calculate USD value if price is available
      if (nativeCurrencyPrice) {
        const feeUsd = parseFloat(formattedFee) * nativeCurrencyPrice
        setEstimatedFeeUsd(feeUsd.toFixed(2))
      } else {
        setEstimatedFeeUsd(null)
      }
    } catch (error) {
      console.error('Error estimating fee:', error)
      setEstimatedFee(null)
      setEstimatedFeeUsd(null)
    }
  }, [address, amount, publicClient, accountAddress, isNativeToken, currency, asset.token.address, nativeCurrencyPrice])

  const sendAsset = useCallback(async () => {
    const amounts = tryParseAmount(amount, currency)
    try {
      let result
      if (isNativeToken) {
        // Handle native token transfer
        result = await sendTransactionAsync({
          to: address as `0x${string}`,
          value: amounts?.quotient ?? 0n,
          chainId: asset.chainId,
        })
      } else {
        // Handle ERC20 token transfer
        result = await erc20Contract?.write?.transfer([address as `0x${string}`, amounts?.quotient ?? 0n], {
          account: erc20Contract.account!,
          chain: erc20Contract.chain!,
        })
      }
      setTxHash(result)
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }, [address, amount, erc20Contract, isNativeToken, sendTransactionAsync, asset.chainId])

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddress(value)

    // Basic validation - more complex validation would be implemented in a real app
    if (value && !value.startsWith('0x')) {
      setAddressError(t('Invalid wallet address'))
    } else {
      setAddressError('')
    }
  }

  const handleClearAddress = () => {
    setAddress('')
    setAddressError('')
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    setActivePercentage(null)
  }

  const handlePercentageClick = (percentage: number) => {
    // In a real implementation, this would calculate the exact amount based on the asset balance
    setActivePercentage(percentage)
    // Use value from the asset instead of token.amount
    const calculatedAmount = ((parseFloat(asset.quantity) * percentage) / 100).toFixed(2)
    setAmount(calculatedAmount)
  }

  const chainName = asset.chainId === ChainId.BSC ? 'BNB' : getChainName(asset.chainId)
  const price = asset.price?.usd ?? 0

  // Effect to estimate fee when address and amount are valid
  useEffect(() => {
    if (address && amount && !addressError) {
      estimateTransactionFee()
    } else {
      setEstimatedFee(null)
    }
  }, [address, amount, addressError, estimateTransactionFee])
  if (showConfirmModal) {
    return (
      <SendTransactionFlow
        asset={asset}
        amount={amount}
        recipient={address ?? ''}
        onDismiss={() => {
          setShowConfirmModal(false)
          setAttemptingTxn(false)
          setTxHash(undefined)
        }}
        attemptingTxn={attemptingTxn}
        txHash={txHash}
        chainId={asset.chainId}
        estimatedFee={estimatedFee}
        estimatedFeeUsd={estimatedFeeUsd}
        onConfirm={async () => {
          // In a real implementation, this would be the actual transaction submission
          setAttemptingTxn(true)

          sendAsset().then(() => {
            setAttemptingTxn(false)
          })
        }}
      />
    )
  }
  return (
    <FormContainer>
      <FlexGap alignItems="center" justifyContent="space-between">
        <Text fontSize="20px" fontWeight="bold">
          {t('Send')}
        </Text>
      </FlexGap>

      <Box>
        <Text fontSize="14px" color="textSubtle" mb="8px">
          {t('Recipient address')}
        </Text>
        <AddressInputWrapper>
          <Box position="relative">
            <Input value={address ?? ''} onChange={handleAddressChange} placeholder="0x" style={{ height: '64px' }} />
            {address && (
              <ClearButton
                scale="sm"
                onClick={handleClearAddress}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}
                variant="tertiary"
              >
                <CloseIcon color="textSubtle" />
              </ClearButton>
            )}
          </Box>
        </AddressInputWrapper>
        {addressError && <ErrorMessage>{addressError}</ErrorMessage>}
      </Box>

      <Box mb="16px">
        <FlexGap alignItems="center" gap="8px" mb="8px">
          <AssetContainer>
            <CurrencyLogo currency={currency} size="40px" />
            <ChainIconWrapper>
              <img
                src={`${ASSET_CDN}/web/chains/${asset.chainId}.png`}
                alt={`${chainName}-logo`}
                width="12px"
                height="12px"
              />
            </ChainIconWrapper>
          </AssetContainer>
          <FlexGap flexDirection="column">
            <Text fontWeight="bold" fontSize="20px">
              {asset.token.symbol}
            </Text>
            <Text color="textSubtle" fontSize="12px" mt="-4px">{`${chainName.toUpperCase()} ${t('Chain')}`}</Text>
          </FlexGap>
        </FlexGap>

        <BalanceInput
          value={amount}
          onUserInput={handleAmountChange}
          currencyValue={amount ? `~${(parseFloat(amount) * price).toFixed(2)} USD` : ''}
          placeholder="0.0"
          unit={asset.token.symbol}
        />
        {estimatedFee && address && !addressError && (
          <Box mt="8px">
            <Text fontSize="14px" color="textSubtle">
              {t('Estimated network fee')}: {parseFloat(estimatedFee).toFixed(8)} {chainName}
              {estimatedFeeUsd && ` (~$${estimatedFeeUsd} USD)`}
            </Text>
          </Box>
        )}
        <FlexGap gap="8px" justifyContent="center" mt="8px">
          <Button
            variant="tertiary"
            scale="sm"
            onClick={() => handlePercentageClick(25)}
            style={activePercentage === 25 ? { backgroundColor: 'primary', color: 'white' } : {}}
          >
            25%
          </Button>
          <Button
            variant="tertiary"
            scale="sm"
            onClick={() => handlePercentageClick(50)}
            style={activePercentage === 50 ? { backgroundColor: 'primary', color: 'white' } : {}}
          >
            50%
          </Button>
          <Button
            variant="tertiary"
            scale="sm"
            onClick={() => handlePercentageClick(100)}
            style={activePercentage === 100 ? { backgroundColor: 'primary', color: 'white' } : {}}
          >
            MAX
          </Button>
        </FlexGap>
      </Box>

      <FlexGap gap="16px" mt="16px">
        <ActionButton onClick={onDismiss} variant="tertiary">
          {t('Close')}
        </ActionButton>
        <ActionButton
          onClick={() => {
            setShowConfirmModal(true)
          }}
          disabled={!address || !amount || !!addressError}
        >
          {t('Next')}
        </ActionButton>
      </FlexGap>
    </FormContainer>
  )
}
