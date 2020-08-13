import EmaExp, { DocInfo } from './EmaExp'
import { RangeToken } from './EmaRange'

export default class EmaParser {
  static fromString(docInfo: DocInfo, selection: string) {
    const [m, s, b, c]: string[] = selection.split('/')
    return new EmaExp(docInfo, m, s, b, c)
  }
}