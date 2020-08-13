import EmaRange from './EmaRange'
import EmaBeatRange from './EmaBeatRange'
import EmaStaffRange from './EmaStaffRange'

export default class EmaRangeParser {
  static parseBeatRange(range: string) {
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

  static parseRange(range: string) {
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
    return new EmaRange(start, end)
  }

  static parseStaffRange(range: string) {
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
}