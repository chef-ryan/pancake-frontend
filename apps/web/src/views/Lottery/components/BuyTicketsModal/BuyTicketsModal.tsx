import { useTranslation } from '@pancakeswap/localization'
import { bscTokens } from '@pancakeswap/tokens'
import {
  ArrowForwardIcon,
  BalanceInput,
  Button,
  Flex,
  HelpIcon,
  Modal,
  Skeleton,
  Text,
  Ticket,
  useToast,
  useTooltip,
} from '@pancakeswap/uikit'
import { BIG_ONE_HUNDRED, BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { getFullDisplayBalance } from '@pancakeswap/utils/formatBalance'
import BigNumber from 'bignumber.js'
import ApproveConfirmButtons, { ButtonArrangement } from 'components/ApproveConfirmButtons'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { ToastDescriptionWithTx } from 'components/Toast'
import { FetchStatus } from 'config/constants/types'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { useCakePrice } from 'hooks/useCakePrice'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useLotteryV2Contract } from 'hooks/useContract'
import useTheme from 'hooks/useTheme'
import useTokenBalance from 'hooks/useTokenBalance'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch } from 'state'
import { fetchUserTicketsAndLotteries } from 'state/lottery'
import { useLottery } from 'state/lottery/hooks'
import { styled } from 'styled-components'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { logGTMBuyLotteryTicketsEvent } from 'utils/customGTMEventTracking'
import EditNumbersModal from './EditNumbersModal'
import NumTicketsToBuyButton from './NumTicketsToBuyButton'
import { useTicketsReducer } from './useTicketsReducer'

const StyledModal = styled(Modal)`
  ${({ theme }) => theme.mediaQueries.md} {
    width: 280px;
  }
`

const ShortcutButtonsWrapper = styled(Flex)<{ isVisible: boolean }>`
  justify-content: space-between;
  margin-top: 8px;
  margin-bottom: 24px;
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
`

interface BuyTicketsModalProps {
  onDismiss?: () => void
}

enum BuyingStage {
  BUY = 'Buy',
  EDIT = 'Edit',
}

const getNumTicketsByPercentage = (percentage: number, maxPossibleTicketPurchase: BigNumber): number => {
  const percentageOfMaxTickets = maxPossibleTicketPurchase.gt(0)
    ? maxPossibleTicketPurchase.div(BIG_ONE_HUNDRED).times(new BigNumber(percentage))
    : BIG_ZERO
  return Math.floor(percentageOfMaxTickets.toNumber())
}

const getTicketCostAfterDiscount = (
  numberTickets: BigNumber,
  discountDivisor: BigNumber,
  priceTicketInCake: BigNumber,
) => {
  const totalAfterDiscount = priceTicketInCake
    .times(numberTickets)
    .times(discountDivisor.plus(1).minus(numberTickets))
    .div(discountDivisor)
  return totalAfterDiscount
}

const getDiscountBeingApplied = (
  numberTickets: BigNumber | number,
  discountDivisor: BigNumber,
  priceTicketInCake: BigNumber,
) => {
  const numberOfTicketsToBuy = new BigNumber(numberTickets)
  const costAfterDiscount = getTicketCostAfterDiscount(numberOfTicketsToBuy, discountDivisor, priceTicketInCake)
  const costBeforeDiscount = priceTicketInCake.times(numberOfTicketsToBuy)
  return costBeforeDiscount.minus(costAfterDiscount)
}

const getDiscountPercentage = (
  numberTickets: BigNumber | number,
  discountDivisor: BigNumber,
  priceTicketInCake: BigNumber,
) => {
  const numberOfTicketsToBuy = new BigNumber(numberTickets)
  const discountBeingApplied = getDiscountBeingApplied(numberOfTicketsToBuy, discountDivisor, priceTicketInCake)
  const costBeforeDiscount = priceTicketInCake.times(numberOfTicketsToBuy)

  if (costBeforeDiscount.isZero()) {
    return '0'
  }

  const percentageAsBn = discountBeingApplied.div(costBeforeDiscount).times(100)
  return percentageAsBn.isNaN() || percentageAsBn.eq(0) ? '0' : percentageAsBn.toNumber().toFixed(2)
}

const getMaxTicketBuyWithDiscount = (
  numberTickets: BigNumber,
  discountDivisor: BigNumber,
  priceTicketInCake: BigNumber,
) => {
  const costAfterDiscount = getTicketCostAfterDiscount(numberTickets, discountDivisor, priceTicketInCake)
  const costBeforeDiscount = priceTicketInCake.times(numberTickets)
  const discountAmount = costBeforeDiscount.minus(costAfterDiscount)
  const ticketsBoughtWithDiscount = discountAmount.div(priceTicketInCake)
  const overallTicketBuy = numberTickets.plus(ticketsBoughtWithDiscount)
  return { overallTicketBuy, ticketsBoughtWithDiscount }
}

const BuyTicketsModal: React.FC<React.PropsWithChildren<BuyTicketsModalProps>> = ({ onDismiss }) => {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const {
    maxNumberTicketsPerBuyOrClaim,
    currentLotteryId,
    currentRound: { priceTicketInCake, discountDivisor, userTickets },
  } = useLottery()
  const { tickets: userCurrentTickets = [] } = userTickets ?? {}
  const { callWithGasPrice } = useCallWithGasPrice()
  const [ticketsToBuy, setTicketsToBuy] = useState('')
  const [discountValue, setDiscountValue] = useState('')
  const [totalCost, setTotalCost] = useState('')
  const [ticketCostBeforeDiscount, setTicketCostBeforeDiscount] = useState('')
  const [buyingStage, setBuyingStage] = useState<BuyingStage>(BuyingStage.BUY)
  const [maxPossibleTicketPurchase, setMaxPossibleTicketPurchase] = useState(BIG_ZERO)
  const [maxTicketPurchaseExceeded, setMaxTicketPurchaseExceeded] = useState(false)
  const [userNotEnoughCake, setUserNotEnoughCake] = useState(false)
  const lotteryContract = useLotteryV2Contract()
  const { toastSuccess } = useToast()
  const { balance: userCake, fetchStatus } = useTokenBalance(bscTokens.cake.address)
  // balance from useTokenBalance causes rerenders in effects as a new BigNumber is instantiated on each render, hence memoising it using the stringified value below.
  const stringifiedUserCake = userCake.toJSON()
  const memoizedUserCake = useMemo(() => new BigNumber(stringifiedUserCake), [stringifiedUserCake])

  const cakePrice = useCakePrice()
  const dispatch = useAppDispatch()
  const hasFetchedBalance = fetchStatus === FetchStatus.Fetched
  const userCakeDisplayBalance = getFullDisplayBalance(userCake, 18, 3)

  const TooltipComponent = () => (
    <>
      <Text mb="16px">
        {t(
          'Buying multiple tickets in a single transaction gives a discount. The discount increases in a linear way, up to the maximum of 100 tickets:',
        )}
      </Text>
      <Text>
        {t('%amount% tickets: %discount%%', {
          amount: 2,
          discount: getDiscountPercentage(2, discountDivisor, priceTicketInCake),
        })}
      </Text>
      <Text>
        {t('%amount% tickets: %discount%%', {
          amount: 50,
          discount: getDiscountPercentage(50, discountDivisor, priceTicketInCake),
        })}
      </Text>
      <Text>
        {t('%amount% tickets: %discount%%', {
          amount: 100,
          discount: getDiscountPercentage(100, discountDivisor, priceTicketInCake),
        })}
      </Text>
    </>
  )
  const { targetRef, tooltip, tooltipVisible } = useTooltip(<TooltipComponent />, {
    placement: 'bottom-end',
    tooltipOffset: [20, 10],
  })

  const limitNumberByMaxTicketsPerBuy = useCallback(
    (number: BigNumber) => {
      return number.gt(maxNumberTicketsPerBuyOrClaim) ? maxNumberTicketsPerBuyOrClaim : number
    },
    [maxNumberTicketsPerBuyOrClaim],
  )

  const validateInput = useCallback(
    (inputNumber: BigNumber) => {
      const limitedNumberTickets = limitNumberByMaxTicketsPerBuy(inputNumber)
      const cakeCostAfterDiscount = getTicketCostAfterDiscount(limitedNumberTickets, discountDivisor, priceTicketInCake)

      if (cakeCostAfterDiscount.gt(userCake)) {
        setUserNotEnoughCake(true)
      } else if (limitedNumberTickets.eq(maxNumberTicketsPerBuyOrClaim)) {
        setMaxTicketPurchaseExceeded(true)
      } else {
        setUserNotEnoughCake(false)
        setMaxTicketPurchaseExceeded(false)
      }
    },
    [limitNumberByMaxTicketsPerBuy, maxNumberTicketsPerBuyOrClaim, userCake, discountDivisor, priceTicketInCake],
  )

  useEffect(() => {
    const getMaxPossiblePurchase = () => {
      const maxBalancePurchase = memoizedUserCake.div(priceTicketInCake)
      const limitedMaxPurchase = limitNumberByMaxTicketsPerBuy(maxBalancePurchase)
      let maxPurchase = limitedMaxPurchase

      // If the users' max CAKE balance purchase is less than the contract limit - factor the discount logic into the max number of tickets they can purchase
      if (limitedMaxPurchase.lt(maxNumberTicketsPerBuyOrClaim)) {
        // Get max tickets purchasable with the users' balance, as well as using the discount to buy tickets
        const { overallTicketBuy: maxPlusDiscountTickets } = getMaxTicketBuyWithDiscount(
          limitedMaxPurchase,
          discountDivisor,
          priceTicketInCake,
        )

        // Knowing how many tickets they can buy when counting the discount - plug that total in, and see how much that total will get discounted
        const { ticketsBoughtWithDiscount: secondTicketDiscountBuy } = getMaxTicketBuyWithDiscount(
          maxPlusDiscountTickets,
          discountDivisor,
          priceTicketInCake,
        )

        // Add the additional tickets that can be bought with the discount, to the original max purchase
        maxPurchase = limitedMaxPurchase.plus(secondTicketDiscountBuy)
      }

      if (hasFetchedBalance && maxPurchase.lt(1)) {
        setUserNotEnoughCake(true)
      } else {
        setUserNotEnoughCake(false)
      }

      setMaxPossibleTicketPurchase(maxPurchase)
    }
    getMaxPossiblePurchase()
  }, [
    maxNumberTicketsPerBuyOrClaim,
    priceTicketInCake,
    memoizedUserCake,
    limitNumberByMaxTicketsPerBuy,
    hasFetchedBalance,
    discountDivisor,
  ])

  useEffect(() => {
    const numberOfTicketsToBuy = new BigNumber(ticketsToBuy)
    const discountBeingApplied = getDiscountBeingApplied(numberOfTicketsToBuy, discountDivisor, priceTicketInCake)
    const costBeforeDiscount = priceTicketInCake.times(numberOfTicketsToBuy)
    const costAfterDiscount = getTicketCostAfterDiscount(numberOfTicketsToBuy, discountDivisor, priceTicketInCake)
    setTicketCostBeforeDiscount(costBeforeDiscount.gt(0) ? getFullDisplayBalance(costBeforeDiscount) : '0')
    setTotalCost(costAfterDiscount.gt(0) ? getFullDisplayBalance(costAfterDiscount, 18, 2) : '0')
    setDiscountValue(discountBeingApplied.gt(0) ? getFullDisplayBalance(discountBeingApplied, 18, 5) : '0')
  }, [ticketsToBuy, priceTicketInCake, discountDivisor])

  const tenPercentOfBalance = getNumTicketsByPercentage(10, maxPossibleTicketPurchase)
  const twentyFivePercentOfBalance = getNumTicketsByPercentage(25, maxPossibleTicketPurchase)
  const fiftyPercentOfBalance = getNumTicketsByPercentage(50, maxPossibleTicketPurchase)
  const oneHundredPercentOfBalance = getNumTicketsByPercentage(100, maxPossibleTicketPurchase)

  const handleInputChange = useCallback(
    (input: string) => {
      // Force input to integer
      const inputAsInt = parseInt(input, 10)
      const inputAsBN = new BigNumber(inputAsInt)
      const limitedNumberTickets = limitNumberByMaxTicketsPerBuy(inputAsBN)
      validateInput(inputAsBN)
      setTicketsToBuy(inputAsInt ? limitedNumberTickets.toString() : '')
    },
    [limitNumberByMaxTicketsPerBuy, validateInput],
  )

  const handleNumberButtonClick = useCallback((number: number) => {
    setTicketsToBuy(number.toFixed())
    setUserNotEnoughCake(false)
    setMaxTicketPurchaseExceeded(false)
  }, [])

  const [updateTicket, randomize, tickets, allComplete, getTicketsForPurchase] = useTicketsReducer(
    parseInt(ticketsToBuy, 10),
    userCurrentTickets,
  )

  const { isApproving, isApproved, isConfirming, handleApprove, handleConfirm } = useApproveConfirmTransaction({
    token: bscTokens.cake,
    spender: lotteryContract.address,
    minAmount: parseEther(totalCost as `${number}`),
    onApproveSuccess: useCallback(
      async ({ receipt }) => {
        toastSuccess(
          t('Contract enabled - you can now purchase tickets'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash} />,
        )
      },
      [t, toastSuccess],
    ),
    onConfirm: useCallback(() => {
      const ticketsForPurchase = getTicketsForPurchase()

      logGTMBuyLotteryTicketsEvent(ticketsToBuy)

      return callWithGasPrice(lotteryContract, 'buyTickets', [BigInt(currentLotteryId), ticketsForPurchase])
    }, [callWithGasPrice, currentLotteryId, getTicketsForPurchase, lotteryContract, ticketsToBuy]),
    onSuccess: useCallback(
      async ({ receipt }) => {
        onDismiss?.()
        if (account) {
          dispatch(fetchUserTicketsAndLotteries({ account, currentLotteryId }))
        }
        toastSuccess(t('Lottery tickets purchased!'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
      },
      [t, toastSuccess, account, currentLotteryId, dispatch, onDismiss],
    ),
  })

  const errorMessage = useMemo(() => {
    if (userNotEnoughCake || maxTicketPurchaseExceeded) {
      if (userNotEnoughCake) return t('Insufficient CAKE balance')
      return t('The maximum number of tickets you can buy in one transaction is %maxTickets%', {
        maxTickets: maxNumberTicketsPerBuyOrClaim.toString(),
      })
    }
    return undefined
  }, [t, userNotEnoughCake, maxNumberTicketsPerBuyOrClaim, maxTicketPurchaseExceeded])

  const percentageDiscount = useMemo(() => {
    const percentageAsBn = new BigNumber(discountValue).div(new BigNumber(ticketCostBeforeDiscount)).times(100)
    if (percentageAsBn.isNaN() || percentageAsBn.eq(0)) {
      return 0
    }
    return percentageAsBn.toNumber().toFixed(2)
  }, [discountValue, ticketCostBeforeDiscount])

  const disableBuying = useMemo(
    () =>
      isConfirming ||
      userNotEnoughCake ||
      !ticketsToBuy ||
      new BigNumber(ticketsToBuy).lte(0) ||
      getTicketsForPurchase().length !== parseInt(ticketsToBuy, 10),
    [isConfirming, userNotEnoughCake, ticketsToBuy, getTicketsForPurchase],
  )

  const isApproveDisabled = isApproved || disableBuying

  if (buyingStage === BuyingStage.EDIT) {
    return (
      <EditNumbersModal
        totalCost={totalCost}
        updateTicket={updateTicket}
        randomize={randomize}
        tickets={tickets}
        allComplete={allComplete}
        onConfirm={handleConfirm}
        isConfirming={isConfirming}
        onDismiss={() => setBuyingStage(BuyingStage.BUY)}
      />
    )
  }

  return (
    <StyledModal title={t('Buy Tickets')} onDismiss={onDismiss} headerBackground={theme.colors.gradientCardHeader}>
      {tooltipVisible && tooltip}
      <Flex alignItems="center" justifyContent="space-between" mb="8px">
        <Text color="textSubtle">{t('Buy')}:</Text>
        <Flex alignItems="center" minWidth="70px">
          <Text mr="4px" bold>
            {t('Tickets')}
          </Text>
          <Ticket />
        </Flex>
      </Flex>
      <BalanceInput
        isWarning={Boolean(account && errorMessage)}
        placeholder="0"
        value={ticketsToBuy}
        onUserInput={handleInputChange}
        currencyValue={
          cakePrice.gt(0) &&
          `~${ticketsToBuy ? getFullDisplayBalance(priceTicketInCake.times(new BigNumber(ticketsToBuy))) : '0.00'} CAKE`
        }
      />
      <Flex alignItems="center" justifyContent="flex-end" mt="4px" mb="12px">
        <Flex justifyContent="flex-end" flexDirection="column">
          {account && errorMessage && (
            <Text fontSize="12px" color="failure">
              {errorMessage}
            </Text>
          )}
          {account && (
            <Flex justifyContent="flex-end">
              <Text fontSize="12px" color="textSubtle" mr="4px">
                CAKE {t('Balance')}:
              </Text>
              {hasFetchedBalance ? (
                <Text fontSize="12px" color="textSubtle">
                  {userCakeDisplayBalance}
                </Text>
              ) : (
                <Skeleton width={50} height={12} />
              )}
            </Flex>
          )}
        </Flex>
      </Flex>

      {account && !hasFetchedBalance ? (
        <Skeleton width="100%" height={20} mt="8px" mb="24px" />
      ) : (
        <ShortcutButtonsWrapper isVisible={Boolean(account && hasFetchedBalance && oneHundredPercentOfBalance >= 1)}>
          {tenPercentOfBalance >= 1 && (
            <NumTicketsToBuyButton onClick={() => handleNumberButtonClick(tenPercentOfBalance)}>
              {hasFetchedBalance ? tenPercentOfBalance : ``}
            </NumTicketsToBuyButton>
          )}
          {twentyFivePercentOfBalance >= 1 && (
            <NumTicketsToBuyButton onClick={() => handleNumberButtonClick(twentyFivePercentOfBalance)}>
              {hasFetchedBalance ? twentyFivePercentOfBalance : ``}
            </NumTicketsToBuyButton>
          )}
          {fiftyPercentOfBalance >= 1 && (
            <NumTicketsToBuyButton onClick={() => handleNumberButtonClick(fiftyPercentOfBalance)}>
              {hasFetchedBalance ? fiftyPercentOfBalance : ``}
            </NumTicketsToBuyButton>
          )}
          {oneHundredPercentOfBalance >= 1 && (
            <NumTicketsToBuyButton onClick={() => handleNumberButtonClick(oneHundredPercentOfBalance)}>
              <Text small color="currentColor" textTransform="uppercase">
                {t('Max')}
              </Text>
            </NumTicketsToBuyButton>
          )}
        </ShortcutButtonsWrapper>
      )}
      <Flex flexDirection="column">
        <Flex mb="8px" justifyContent="space-between">
          <Text color="textSubtle" fontSize="14px">
            {t('Cost')} (CAKE)
          </Text>
          <Text color="textSubtle" fontSize="14px">
            {priceTicketInCake && getFullDisplayBalance(priceTicketInCake.times(ticketsToBuy || 0))} CAKE
          </Text>
        </Flex>
        <Flex mb="8px" justifyContent="space-between">
          <Flex>
            <Text display="inline" bold fontSize="14px" mr="4px">
              {discountValue && totalCost ? percentageDiscount : 0}%
            </Text>
            <Text display="inline" color="textSubtle" fontSize="14px">
              {t('Bulk discount')}
            </Text>
            <Flex alignItems="center" justifyContent="center" ref={targetRef}>
              <HelpIcon ml="4px" width="14px" height="14px" color="textSubtle" />
            </Flex>
          </Flex>
          <Text fontSize="14px" color="textSubtle">
            ~{discountValue} CAKE
          </Text>
        </Flex>
        <Flex borderTop={`1px solid ${theme.colors.cardBorder}`} pt="8px" mb="24px" justifyContent="space-between">
          <Text color="textSubtle" fontSize="16px">
            {t('You pay')}
          </Text>
          <Text fontSize="16px" bold>
            ~{totalCost} CAKE
          </Text>
        </Flex>

        {account ? (
          <>
            <ApproveConfirmButtons
              isApproveDisabled={isApproveDisabled}
              isApproving={isApproving}
              isConfirmDisabled={disableBuying}
              isConfirming={isConfirming}
              onApprove={handleApprove}
              onConfirm={handleConfirm}
              buttonArrangement={ButtonArrangement.SEQUENTIAL}
              confirmLabel={t('Buy Instantly')}
              confirmId="lotteryBuyInstant"
            />
            {isApproved && (
              <Button
                variant="secondary"
                mt="8px"
                endIcon={
                  <ArrowForwardIcon
                    ml="2px"
                    color={disableBuying ? 'disabled' : 'primary'}
                    height="24px"
                    width="24px"
                  />
                }
                disabled={disableBuying}
                onClick={() => {
                  setBuyingStage(BuyingStage.EDIT)
                }}
              >
                {t('View/Edit Numbers')}
              </Button>
            )}
          </>
        ) : (
          <ConnectWalletButton />
        )}

        <Text mt="24px" fontSize="12px" color="textSubtle">
          {t(
            '"Buy Instantly" chooses random numbers, with no duplicates among your tickets. Prices are set before each round starts, equal to $5 at that time. Purchases are final.',
          )}
        </Text>
      </Flex>
    </StyledModal>
  )
}

export default BuyTicketsModal
