export type RangeToken = number | 'all' | 'start' | 'end'

export default class EmaRange {
  start: RangeToken
  end: RangeToken

  public constructor(start: RangeToken, end: RangeToken) {
    this.start = start
    this.end = end
  }

  public static makeRange(size: number, startAt: number = 0): ReadonlyArray<number> {
    return [...Array(size).keys()].map(i => i + startAt)
  }

  public static parseEmaToken(token: string, float: boolean = false): RangeToken {
    if (token === 'all' || token === 'start' || token === 'end') {
      return token
    }
    if (float) {
      return parseFloat(token)
    }
    return parseInt(token, 10)
  }

  // Converts range to a list of integers, given a known total
  // to interpret shorthands "end" and "all".
  public toArray(total: number) : ReadonlyArray<number> {
    const start = this.start === 'start' || this.start === 'all' ? 1 : this.start as number
    const end = this.end === 'end' || this.end === 'all' ? total : this.end as number
    if (start < 0 || end > total) {
      throw Error('EMA Range out of bounds')
    }
    return EmaRange.makeRange((end + 1) - start, start)
  }

  public toString = () : string => {
    return `[${this.start} ${this.end}]`
  }
}
