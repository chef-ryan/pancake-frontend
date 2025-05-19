import { Logger } from '@datadog/browser-logs'
import { getLogger } from 'utils/datadog'

export interface BasePerf {
  perf: Record<string, number>
  error: string
}

type BaseTrackKey = 'success' | 'fail' | 'start' | 'duration'
type ExtendTrackKey = 'pool_success' | 'pool_error' | BaseTrackKey
export class PerfTracker<TTraceData extends BasePerf> {
  protected records: [ExtendTrackKey, number][] = []

  protected trace: TTraceData

  private start: number

  private logger: Logger

  constructor(topic: string, trace: TTraceData, start: number) {
    this.trace = trace
    this.start = start
    this.logger = getLogger(topic)
  }

  public track(key: ExtendTrackKey) {
    this.records.push([key, Date.now() - this.start])
  }

  public getRecords() {
    const records: Record<string, number> = {}
    this.records.forEach(([key, value]) => {
      records[key] = value
    })
    return records as Record<ExtendTrackKey, number>
  }

  public success() {
    this.track('success' as ExtendTrackKey)
  }

  public fail(ex: any) {
    if (ex instanceof Error) {
      this.trace.error = ex.message
    } else {
      this.trace.error = String(ex)
    }
    this.track('fail')
  }

  public report() {
    const records = this.getRecords()
    this.trace.perf = records
    const end = this.trace.perf.success || this.trace.perf.fail
    const start = this.trace.perf.start
    const duration = end - start
    this.trace.perf.duration = duration
    this.logger.log('quote', this.trace)
  }
}
