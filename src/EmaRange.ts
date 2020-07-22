export type RangeToken = number | 'all' | 'start' | 'end'

export default class EmaRange {
  start: RangeToken
  end: RangeToken

  public constructor(start: RangeToken, end: RangeToken) {
    this.start = start
    this.end = end
  }

  // Converts range to a list of integers, given a known total
  // to interpret shorthands "end" and "all".
  public toArray(total: number) : ReadonlyArray<number> {
    const start = this.start === 'start' || this.start === 'all' ? 1 : this.start as number
    const end = this.end === 'end' || this.end === 'all' ? total : this.end as number
    if (start < 0 || end > total) {
      throw Error('EMA Range out of bounds')
    }
    return makeRange((end + 1) - start, start)
  }

  public toString = () : string => {
    return `[${this.start} ${this.end}]`
  }

}

export function fromString(range: string) {
  const x = range.split('-')
  const start = parseEmaToken(x[0])
  const end = parseEmaToken(x[x.length - 1])
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
  return new EmaRange(start, end)
}

export function parseEmaToken(token: string, float: boolean = false): RangeToken {
  if (token === 'all' || token === 'start' || token === 'end') {
    return token
  }
  if (float) {
    return parseFloat(token)
  }
  return parseInt(token, 10)
}

export function makeRange(size: number, startAt: number = 0): ReadonlyArray<number> {
  return [...Array(size).keys()].map(i => i + startAt)
}
