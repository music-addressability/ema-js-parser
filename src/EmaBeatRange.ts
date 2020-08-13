import EmaRange from './EmaRange'

export default class EmaBeatRange extends EmaRange {
  // Converts range to a list of numbers, given beat information.
  public toArray(total: number) : ReadonlyArray<number> {
    const res = this.resolveRangeTokens(total)
    const startInt = Math.floor(res.start as number)
    const endInt = Math.floor(res.end as number)
    const range = Array.from(EmaRange.makeRange((endInt + 1) - startInt, startInt))
    range[0] = res.start as number
    range[range.length - 1] = res.end  as number
    return range
  }

  public resolveRangeTokens(count: number) : EmaBeatRange {
    // beats extend beyond the total by one. E.g. 4.5 is a valid beat in 4/4
    const countExt = count + 1
    const start = this.start === 'start' || this.start === 'all' ? 1.00 : this.start as number
    const end = this.end === 'end' || this.end === 'all' ? countExt : this.end as number
    if (start < 0 || end > countExt) {
      throw Error('EMA Range out of bounds')
    }
    return new EmaBeatRange(start, end)
  }
}
