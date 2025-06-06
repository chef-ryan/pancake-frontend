import { ChainId, getChainName } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { Token } from '@pancakeswap/sdk'
import { BalanceInput, Box, Button, CloseIcon, FlexGap, IconButton, Input, Text } from '@pancakeswap/uikit'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { BalanceData } from 'hooks/useAddressBalance'
import { useState } from 'react'
import styled from 'styled-components'
import { ActionButton } from './ActionButton'
import SendTransactionModal from './SendTransactionModal'

const FormContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const AssetContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
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
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [addressError, setAddressError] = useState('')
  const [activePercentage, setActivePercentage] = useState<number | null>(null)

  // Transaction state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)

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
  const currency = new Token(
    asset.chainId,
    asset.token.address as `0x${string}`,
    asset.token.decimals,
    asset.token.symbol,
    asset.token.name,
  )
  const price = asset.price?.usd ?? 0

  return (
    <FormContainer>
      <FlexGap alignItems="center" justifyContent="space-between">
        <Text fontSize="20px" fontWeight="bold">
          {t('Send')}
        </Text>
        <AssetContainer>
          <CurrencyLogo currency={currency} size="24px" />
          <Text fontWeight="bold">{asset.token.symbol}</Text>
          <Text color="textSubtle">{chainName}</Text>
        </AssetContainer>
      </FlexGap>

      <Box>
        <Text fontSize="14px" color="textSubtle" mb="8px">
          {t('Recipient address')}
        </Text>
        <AddressInputWrapper>
          <Box position="relative">
            <Input value={address} onChange={handleAddressChange} placeholder="0x" height="64px" />
            {address && (
              <ClearButton
                scale="sm"
                onClick={handleClearAddress}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}
              >
                <CloseIcon color="primary" />
              </ClearButton>
            )}
          </Box>
        </AddressInputWrapper>
        {addressError && <ErrorMessage>{addressError}</ErrorMessage>}
      </Box>

      <Box mb="16px">
        <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight="bold" mb="8px">
          {t('Amount')}
        </Text>
        <BalanceInput
          value={amount}
          onUserInput={handleAmountChange}
          currencyValue={amount ? `~${(parseFloat(amount) * price).toFixed(2)} USD` : ''}
          placeholder="0.0"
          unit={asset.token.symbol}
        />
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

      {showConfirmModal && (
        <SendTransactionModal
          asset={asset}
          amount={amount}
          recipient={address}
          onDismiss={() => {
            setShowConfirmModal(false)
            setAttemptingTxn(false)
            setTxHash(undefined)
          }}
          attemptingTxn={attemptingTxn}
          txHash={txHash}
          chainId={asset.chainId}
          onConfirm={async () => {
            // In a real implementation, this would be the actual transaction submission
            setAttemptingTxn(true)

            // Simulate transaction processing
            setTimeout(() => {
              // Generate a mock transaction hash
              setTxHash('0x0960a...989c')
              setAttemptingTxn(false)
            }, 2000)
          }}
        />
      )}
    </FormContainer>
  )
}
