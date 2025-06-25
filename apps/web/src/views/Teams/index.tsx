import { AutoRenewIcon, Flex, Heading } from '@pancakeswap/uikit'
import orderBy from 'lodash/orderBy'
import Page from 'components/Layout/Page'
import { useTranslation } from '@pancakeswap/localization'
import { useAtomValue } from 'jotai'
import { Suspense } from 'react'
import TeamListCard from './components/TeamListCard'
import TeamHeader from './components/TeamHeader'
import { teamsAtom } from './atom/teamsAtom'

const TeamsContent = () => {
  const { t } = useTranslation()
  const data = useAtomValue(teamsAtom)
  const teamList = data ? Object.values(data) : []
  const topTeams = orderBy(teamList, ['points', 'id', 'name'], ['desc', 'asc', 'asc'])

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" mb="32px">
        <Heading scale="xl">{t('Teams')}</Heading>
      </Flex>
      {topTeams.map((team, index) => (
        <TeamListCard key={team.id} rank={index + 1} team={team} />
      ))}
    </>
  )
}

const Teams = () => (
  <Page>
    <TeamHeader />
    <Suspense fallback={<AutoRenewIcon spin />}>
      <TeamsContent />
    </Suspense>
  </Page>
)

export default Teams
