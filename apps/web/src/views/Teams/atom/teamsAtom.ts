import { atomWithAsyncRetry } from 'utils/atomWithAsyncRetry'
import { getTeams } from 'state/teams/helpers'
import { TeamsById } from 'state/types'

export const teamsAtom = atomWithAsyncRetry<TeamsById | null>({
  asyncFn: async () => {
    const data = await getTeams()
    return data ?? null
  },
  fallbackValue: null,
})
