import { useTranslation } from '@pancakeswap/localization'
import { Button, Card, CardBody, FlexGap, Text } from '@pancakeswap/uikit'
import { useStablecoinPriceAmount } from 'hooks/useStablecoinPrice'
import useTheme from 'hooks/useTheme'
import { useIDOCurrencies } from 'views/Idos/hooks/ido/useIDOCurrencies'
import { IDOUserStatus } from 'views/Idos/hooks/ido/useIDOUserStatus'
import { formatDollarAmount } from './IdoDepositButton'

export const ClaimedCard: React.FC<{
  userStatus: IDOUserStatus | undefined
  pid: number
}> = ({ userStatus, pid }) => {
  const { t } = useTranslation()
  const { theme, isDark } = useTheme()
  const claimed = userStatus?.claimed
  const userHasStaked = userStatus?.stakedAmount?.greaterThan(0)
  const claimableAmount = userStatus?.claimableAmount?.toSignificant(6)
  const { offeringCurrency, stakeCurrency0, stakeCurrency1 } = useIDOCurrencies()
  const amountInDollar = useStablecoinPriceAmount(
    offeringCurrency ?? undefined,
    claimableAmount !== undefined && Number.isFinite(+claimableAmount) ? +claimableAmount : undefined,
    {
      hideIfPriceImpactTooHigh: true,
      enabled: Boolean(claimableAmount !== undefined && Number.isFinite(+claimableAmount)),
    },
  )

  if (!claimed || !userHasStaked) {
    return null
  }

  return (
    <Card background={isDark ? '#18171A' : theme.colors.background} mb="16px">
      <CardBody>
        <FlexGap flexDirection="column" gap="8px">
          <FlexGap flexDirection="column" mt="8px">
            <Text textTransform="uppercase" color="secondary" fontSize="12px" bold>
              {offeringCurrency?.symbol} {t('allocated')}
            </Text>
            <Text fontSize="20px" bold lineHeight="30px">
              {claimableAmount}
            </Text>
            <FlexGap>
              {Number.isFinite(amountInDollar) ? (
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
        </FlexGap>
        <FlexGap flexDirection="row" gap="8px" mt="16px">
          <Button
            variant="secondary"
            px="14px"
            width="100%"
            style={{ whiteSpace: 'nowrap' }}
            as="a"
            href="bnc://app.binance.com/mp/app?appId=xoqXxUSMRccLCrZNRebmzj&startPagePath=cGFnZXMvd2FsbGV0L2hvbWUvaW5kZXg=&showOptions=2"
          >
            {t('View in Wallet')}
          </Button>
          <Button
            width="100%"
            as="a"
            px="14px"
            style={{ whiteSpace: 'nowrap' }}
            href="bnc://app.binance.com/mp/app?appId=xoqXxUSMRccLCrZNRebmzj&startPagePath=cGFnZXMvc3dhcC9pbmRleA&startPageQuery=ZnJvbUJpbmFuY2VDaGFpbklkPTU2JnRvQmluYW5jZUNoYWluSWQ9NTYmZnJvbVRva2VuQWRkcmVzcz0weDU1ZDM5ODMyNmY5OTA1OWZGNzc1NDg1MjQ2OTk5MDI3QjMxOTc5NTUmdG9Ub2tlbkFkZHJlc3M9MHhlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVl&showOptions=2"
          >
            {t('Swap %token%', { token: offeringCurrency?.symbol })}
          </Button>
        </FlexGap>
      </CardBody>
    </Card>
  )
}
