/* eslint-disable class-methods-use-this */
import { FarmQuery } from 'state/farmsV4/search/edgeFarmQueries'

enum PoolSearcherState {
  IDLE,
  SEARCHING,
  SEARCH_COMPLETED,
  SEARCH_FAILED,
}
export class PoolSearcher {
  private state: PoolSearcherState = PoolSearcherState.IDLE

  public search(query: FarmQuery) {}
}
