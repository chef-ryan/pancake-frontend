import { Box, Flex, HStack, Spacer, Text, VStack } from '@chakra-ui/react'
import { ApiV3PoolInfoItem, solToWSol } from '@raydium-io/raydium-sdk-v2'

import Decimal from 'decimal.js'
import { useTranslation } from '@pancakeswap/localization'
import Button from '@/components/Button'
import EditIcon from '@/icons/misc/EditIcon'
import { colors } from '@/theme/cssVariables'
import useTokenPrice from '@/hooks/token/useTokenPrice'

import PoolReviewItem from './PoolReviewItem'
import RewardReviewItem from './RewardReviewItem'
import { NewRewardInfo } from '../../type'
import { RewardTotalValue } from './RewardTotalValue'

export default function DetailReview(props: {
  rewardInfos: NewRewardInfo[]
  poolInfo: ApiV3PoolInfoItem | undefined
  isSending: boolean
  onClickBackButton(): void
  onClickCreateFarmButton(): void
  onJumpToStepSelect(): void
  onJumpToStepReward(): void
}) {
  const { t } = useTranslation()
  const { data: tokenPrices } = useTokenPrice({
    mintList: props.rewardInfos.map((r) => r.token?.address)
  })

  let total = new Decimal(0)

  props.rewardInfos.forEach((r) => {
    total = total.add(new Decimal(r.amount || 0).mul(tokenPrices[solToWSol(r.token?.address || '').toString() || '']?.value || 0))
  })

  return (
    <Box>
      <Flex direction="column" w="full" gap={6}>
        <Box>
          <HStack mb={2}>
            <Text>{t('Pool')}</Text>
            <Spacer />
            <Box cursor="pointer" onClick={props.onJumpToStepSelect}>
              <EditIcon />
            </Box>
          </HStack>
          {props.poolInfo && <PoolReviewItem poolInfo={props.poolInfo} />}
        </Box>

        <Box>
          <HStack mb={2}>
            <Text>{t('Farming rewards')}</Text>
            <Spacer />
            <Box cursor="pointer" onClick={props.onJumpToStepReward}>
              <EditIcon />
            </Box>
          </HStack>
          <VStack align="stretch" spacing={4}>
            {props.rewardInfos.map((reward) => (
              <RewardReviewItem key={reward.token?.address} rewardInfo={reward} />
            ))}
          </VStack>
          <RewardTotalValue total={total.toString()} />
        </Box>

        {/* alert text */}
        <Box fontSize="sm" fontWeight={500}>
          <Text color={colors.semanticError} display="inline">
            {t('Please Note')}:{' '}
          </Text>
          <Text color={colors.textTertiary} display="inline">
            {t(
              'Rewards allocated to farms cannot be withdrawn after farming starts. Newly created farms generally appear on Raydium 10-30 minutes after creation, depending on Solana network status.'
            )}
          </Text>
        </Box>

        <Flex justify="space-between" align="center" mt={7} gap={3}>
          <Button size={['lg', 'md']} variant="outline" flexBasis="120px" onClick={props.onClickBackButton}>
            {t('Back')}
          </Button>
          <Button size={['lg', 'md']} flexBasis="300px" isLoading={props.isSending} onClick={props.onClickCreateFarmButton}>
            {t('Create Farm')}
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}
