import * as EmaRange from './EmaRange'

export default class EmaBeatRange extends EmaRange.default {
  public partiallyResolveRangeTokens() : EmaBeatRange {
    const start = this.start === 'start' || this.start === 'all' ? 1.00 : this.start as number
    const end = this.end === 'end' || this.end === 'all' ? 'end' : this.end as number
    return new EmaBeatRange(start, end)
  }
}

export function fromString(range: string) {
  const x = range.split('-')
  const start = EmaRange.parseEmaToken(x[0], true)
  const end = EmaRange.parseEmaToken(x[x.length - 1], true)
  // check that start/end shorthands make sense, if present
  if (x.length > 1) {
    if (start === 'end' && end !== 'end') {
      throw new Error('Bad API request')
    }
    if (end === 'start' && start !== 'start') {
      throw new Error('Bad API request')
    }
    if (start === 'all' && end === 'all') {
      throw new Error('Bad API request')
    }
  }
  return new EmaBeatRange(start, end)
}
