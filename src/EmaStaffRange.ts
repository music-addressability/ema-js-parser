import * as EmaRange from './EmaRange'

export default class EmaStaffRange extends EmaRange.default {}

export function fromString(range: string) {
  const x = range.split('-')
  const start = EmaRange.parseEmaToken(x[0])
  const end = EmaRange.parseEmaToken(x[x.length - 1])
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
  return new EmaStaffRange(start, end)
}