import { useTranslation } from '@pancakeswap/localization'
import { Percent } from '@pancakeswap/sdk'
import { CurrencyAmount, type Currency } from '@pancakeswap/swap-sdk-core'
import { Box, Button, FlexGap, LazyAnimatePresence, Loading, Text, domAnimation } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { CurrencyLogo, SwapUIV2 } from '@pancakeswap/widgets-internal'
import BigNumber from 'bignumber.js'
import { useStablecoinPriceAmount } from 'hooks/useStablecoinPrice'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'

import { logGTMIfoDepositEvent } from 'utils/customGTMEventTracking'
import { CAKE } from '@pancakeswap/tokens'
import { useIFODuration } from '../../hooks/ifo/useIFODuration'
import type { IFOUserStatus } from '../../hooks/ifo/useIFOUserStatus'
import { useIFODepositCallback } from '../../hooks/ifo/useIFODepositCallback'
import IfoSubmittingCard from '../IfoSubmittingCard'
import useIfo from '../../hooks/useIfo'

export const formatDollarAmount = (amount: number) => {
  if (amount > 0 && amount < 0.01) {
    return '<0.01'
  }
  return formatNumber(amount)
}

interface IfoDepositFormProps {
  userStatus: IFOUserStatus | undefined
  pid: number
  onDismiss?: () => void
}

export const IfoDepositForm: React.FC<IfoDepositFormProps> = ({ userStatus, pid, onDismiss }) => {
  const { t } = useTranslation()
  const [value, setValue] = useState('')

  const { info, pools } = useIfo()
  const duration = info?.duration ?? 0
  const poolInfo = pools?.[pid]
  const stakeCurrency = userStatus?.stakedAmount?.currency ?? poolInfo?.stakeCurrency
  const maxStakePerUser = useMemo(() => {
    if (!poolInfo?.stakeCurrency) return undefined
    return CurrencyAmount.fromRawAmount(poolInfo.stakeCurrency, poolInfo.capPerUserInLP)
  }, [poolInfo])

  const { address: account } = useAccount()
  const inputBalance = useCurrencyBalance(account ?? undefined, stakeCurrency ?? undefined)
  const balance = stakeCurrency ? formatAmount(inputBalance, 6) : undefined
  const { deposit, status } = useIFODepositCallback()
  const router = useRouter()
  const [submittedDeposit, setSubmittedDeposit] = useState<CurrencyAmount<Currency> | undefined>()

  const maxAmountInput = useMemo(() => maxAmountSpend(inputBalance), [inputBalance])

  const getPercentAmount = useCallback(
    (percent: number) => {
      return maxAmountInput.multiply(new Percent(percent, 100))
    },
    [maxAmountInput],
  )

  const handlePercentInput = useCallback(
    (percent: number) => {
      if (maxAmountInput) {
        const percentAmount = getPercentAmount(percent)
        if (
          userStatus?.stakedAmount &&
          maxStakePerUser &&
          !maxStakePerUser.equalTo(0) &&
          percentAmount.greaterThan(maxStakePerUser.subtract(userStatus?.stakedAmount))
        ) {
          setValue(maxStakePerUser.subtract(userStatus?.stakedAmount).toExact())
        } else setValue(percentAmount.toExact())
      }
    },
    [maxAmountInput, getPercentAmount, userStatus?.stakedAmount, maxStakePerUser],
  )

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      setValue(maxAmountInput.toExact())
    }
  }, [maxAmountInput])

  const tokenBalanceMultiplier = useMemo(
    () => new BigNumber(10).pow(stakeCurrency?.decimals ?? 18),
    [stakeCurrency?.decimals],
  )

  const depositAmount =
    stakeCurrency && value !== ''
      ? CurrencyAmount.fromRawAmount(stakeCurrency, new BigNumber(value ?? 0).times(tokenBalanceMultiplier).toFixed(0))
      : undefined

  const totalDepositedAmount = stakeCurrency
    ? CurrencyAmount.fromRawAmount(stakeCurrency, userStatus?.stakedAmount?.quotient ?? 0).add(
        CurrencyAmount.fromRawAmount(stakeCurrency, depositAmount?.quotient ?? 0),
      )
    : undefined

  const maxDepositExceeded = useMemo(() => {
    return maxStakePerUser && !maxStakePerUser.equalTo(0) && totalDepositedAmount?.greaterThan(maxStakePerUser)
  }, [maxStakePerUser, totalDepositedAmount])

  const isUserInsufficientBalance = useMemo(() => {
    if (depositAmount && inputBalance) {
      return depositAmount.greaterThan(inputBalance)
    }
    return false
  }, [depositAmount, inputBalance])

  const amountInDollar = useStablecoinPriceAmount(
    stakeCurrency ?? undefined,
    value !== undefined && Number.isFinite(+value) ? +value : undefined,
    {
      enabled: Boolean(value !== undefined && Number.isFinite(+value)),
    },
  )
  const isInputloading = inputBalance === undefined

  const accountEllipsis = account ? `${account.substring(0, 2)}...${account.substring(account.length - 4)}` : null

  const handleConfirmDeposit = async () => {
    if (depositAmount) {
      setSubmittedDeposit(depositAmount)
      const hash = await deposit(pid, depositAmount, () => {})
      if (hash) {
        logGTMIfoDepositEvent()
      }
      setValue('')
    }
  }

  const durationText = useIFODuration(duration)

  const inputRef = useRef<HTMLDivElement>(null)

  const handleInputFocus = useCallback(() => {
    if (inputRef.current) {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  // issue: https://issues.chromium.org/issues/41177736
  // android may not trigger blur event when keyboard hide
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isSoftKeyboardOpen =
      Math.min(window.innerWidth / window.screen.width, window.innerHeight / window.screen.height) < 0.7
    if (
      document.activeElement?.tagName === 'INPUT' &&
      document.activeElement?.id === `ifoStakeCurrency${stakeCurrency?.symbol}` &&
      !isSoftKeyboardOpen
    ) {
      ;(document.activeElement as HTMLInputElement).blur()
    }
  }, [stakeCurrency?.symbol])

  useEffect(() => {
    if (status === 'IDLE') {
      setSubmittedDeposit(undefined)
    }
    if (status === 'CONFIRMED' || status === 'CONFIRMING') {
      const timer = setTimeout(() => {
        window.history.go(-1)
      }, 3000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [status, router])

  if (status === 'PENDING' || status === 'CONFIRMING' || status === 'CONFIRMED') {
    return submittedDeposit ? <IfoSubmittingCard deposit={submittedDeposit} /> : null
  }

  return (
    <FlexGap flexDirection="column" gap="8px" ref={inputRef} width="100%">
      <SwapUIV2.CurrencyInputPanelSimplify
        id={`ifoStakeCurrency${stakeCurrency?.symbol ?? ''}`}
        disabled={false}
        error={maxDepositExceeded}
        value={value}
        placeholder="0.00"
        onInputFocus={handleInputFocus}
        onUserInput={setValue}
        top={
          <FlexGap flexDirection="column" gap="8px" width="100%">
            <FlexGap justifyContent="space-between" alignItems="center">
              <Text fontSize="12px" bold>
                {t('Address')}
              </Text>
              <Text>{accountEllipsis}</Text>
            </FlexGap>
            <FlexGap justifyContent="space-between" alignItems="center" position="relative">
              <Text fontSize="12px" bold>
                {t('Deposit')}
              </Text>
              <LazyAnimatePresence mode="wait" features={domAnimation}>
                {account ? (
                  <SwapUIV2.WalletAssetDisplay
                    isUserInsufficientBalance={isUserInsufficientBalance}
                    balance={balance}
                    onMax={handleMaxInput}
                  />
                ) : null}
              </LazyAnimatePresence>
            </FlexGap>
          </FlexGap>
        }
        inputLeft={
          <FlexGap alignItems="center">
            {stakeCurrency && <CurrencyLogo size="40px" currency={stakeCurrency} />}
          </FlexGap>
        }
        bottom={
          isInputloading || Number.isFinite(amountInDollar) ? (
            <Box position="absolute" bottom="12px" right="0px">
              <FlexGap justifyContent="flex-end" mr="1rem">
                <FlexGap maxWidth={['120px', '160px', '200px', '240px']}>
                  {isInputloading ? (
                    <Loading width="14px" height="14px" />
                  ) : Number.isFinite(amountInDollar) ? (
                    <>
                      <Text fontSize="14px" color="textSubtle" ellipsis>
                        {`~${amountInDollar && formatDollarAmount(amountInDollar)}`}
                      </Text>
                      <Text ml="4px" fontSize="14px" color="textSubtle">
                        USD
                      </Text>
                    </>
                  ) : null}
                </FlexGap>
              </FlexGap>
            </Box>
          ) : null
        }
      />
      {maxDepositExceeded && <Text color="failure">{t('Max stake per user exceeded')}</Text>}
      <FlexGap>
        {maxAmountInput?.greaterThan(0) &&
          [25, 50, 75, 100].map((percent) => {
            const isAtCurrentPercent = maxAmountInput && value !== '0' && value === getPercentAmount(percent).toExact()
            return (
              <Button
                key={`btn_quickCurrency${percent}`}
                data-dd-action-name={`Balance percent ${percent}`}
                onClick={() => {
                  handlePercentInput(percent)
                }}
                scale="sm"
                mr="5px"
                width="100%"
                variant={isAtCurrentPercent ? 'primary' : 'secondary'}
                style={{ textTransform: 'uppercase' }}
              >
                {percent === 100 ? t('Max') : `${percent}%`}
              </Button>
            )
          })}
      </FlexGap>
      <FlexGap flexDirection="column" gap="8px">
        <FlexGap justifyContent="space-between">
          <Text color="textSubtle">{t('Project Duration')}</Text>
          <Text>{durationText}</Text>
        </FlexGap>
        {maxStakePerUser && !maxStakePerUser.equalTo(0) && (
          <FlexGap justifyContent="space-between">
            <Text color="textSubtle">{t('Max. stake per user')}</Text>
            <Text>
              {maxStakePerUser?.toSignificant(6)} {stakeCurrency?.symbol ?? ''}
            </Text>
          </FlexGap>
        )}
        {userStatus?.stakedAmount?.greaterThan(0) ? (
          <FlexGap justifyContent="space-between">
            <Text color="textSubtle">{t('Subscribed')}</Text>
            <Text>
              {userStatus?.stakedAmount?.toSignificant(6)} {stakeCurrency?.symbol ?? ''}
            </Text>
          </FlexGap>
        ) : null}
        <Text color="textSubtle" fontSize="12px">
          {t(
            'Some Rules/ T&C context or information that user need to know before locking BNB/ participating in TGE, show here.',
          )}
        </Text>
        <Button
          disabled={
            value === '' ||
            !depositAmount ||
            depositAmount.equalTo(0) ||
            isUserInsufficientBalance ||
            maxDepositExceeded
          }
          width="100%"
          onClick={handleConfirmDeposit}
        >
          {t('Confirm Deposit')}
        </Button>
        {onDismiss && (
          <Button mt="4px" width="100%" variant="secondary" onClick={onDismiss}>
            {t('Cancel')}
          </Button>
        )}
      </FlexGap>
    </FlexGap>
  )
}
