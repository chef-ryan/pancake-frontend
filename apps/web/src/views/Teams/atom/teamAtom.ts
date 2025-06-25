import { atomFamily } from 'jotai/utils'
import { atomWithAsyncRetry } from 'utils/atomWithAsyncRetry'
import { getTeam } from 'state/teams/helpers'
import { Team } from 'config/constants/types'

export const teamAtom = atomFamily((id: string | number | undefined) =>
  atomWithAsyncRetry<Team | null>({
    asyncFn: async () => {
      if (!id) return null
      return getTeam(Number(id))
    },
    fallbackValue: null,
  }),
)
