import EmaRange from './EmaRange'
import EmaStaffRange from './EmaStaffRange'
import EmaBeatRange from './EmaBeatRange'
import EmaSelection from './EmaSelection'

export type Completeness = 'raw' | 'signature' | 'nospace' | 'cut' | 'highlight'

export interface DocInfo {
  measures: number
  measure_labels?: string[]
  staves: StavesInfo
  beats: BeatsInfo
  completeness?: Completeness
}

export interface StavesInfo {
  [key: number]: string[]
}

export interface BeatsInfo {
  [key: number]: BeatInfo
}

export interface BeatInfo {
  count: number
  unit: number
}

export default class EmaExp {
  // A class to parse an EMA expression given EMA information about a music document.
  docInfo: DocInfo
  measures: string
  staves: string
  beats: string
  completeness: string
  private _measureRanges: EmaRange[]
  private _staffRanges: EmaStaffRange[][]
  private _beatRanges: EmaBeatRange[][][]
  selection: EmaSelection

  constructor(docInfo: DocInfo, measures: string, staves: string, beats: string, completeness?: string) {
    this.docInfo = docInfo
    this.measures = measures
    this.staves = staves
    this.beats = beats
    this.completeness = completeness

    this._measureRanges = measures.split(',').map(range => EmaRange.parseRange(range))
    this._staffRanges = staves.split(',').map(mRange => {
      return mRange.split('+').map(sRange => EmaStaffRange.parseRange(sRange))
    })
    this._beatRanges = beats.split(',').map(mRange => {
      return mRange.split('+').map(bRange => {
        return bRange.split('@').slice(1).map(range => EmaBeatRange.parseRange(range))
      })
    })
    this.selection = this.getSelection()
  }

  public static fromString(docInfo: DocInfo, selection: string): EmaExp {
    // Normalize slashes
    let normalizedSelection = selection.replace(/^\/+/, '')
    normalizedSelection = normalizedSelection.replace(/\/{2,}/g, '/')
    const [m, s, b, c]: string[] = normalizedSelection.split('/')
    return new EmaExp(docInfo, m, s, b, c)
  }

  private getSelection(): EmaSelection {
    const selection = new EmaSelection([])
    const measuresByIndex = this._measureRanges.map(m => {
      return m.toArray(this.docInfo.measures)
    })
    // Build measures
    measuresByIndex.flat().map((requestedMeasure, measureIdx) => {
      // Handle expression like 1-3/@all/... (staff expression mapping to multiple measures)
      // If there is only one staff specified, keep looking for staff data under the same measure
      let m = measureIdx
      if (this._staffRanges.length === 1) {
        m = 0
      }
      const stavesByIndex = this._staffRanges[m].map(s => {
        // Pass the staff data specific to the measure
        const stavesCount = Object.keys(this.docInfo.staves).reduce((count: number, changeAtMeasure) => {
          const changeNum = parseInt(changeAtMeasure, 10)
          if (requestedMeasure - 1 >= changeNum) {
            count = this.docInfo.staves[changeNum].length
          }
          return count
        }, 0)
        return s.toArray(stavesCount)
      })
      // Build staves
      const selectedStaves: EmaSelection = new EmaSelection([])
      const staves = Array.from(new Set(stavesByIndex.flat().sort()))

      staves.map((requestedStaff, staffIdx) => {
        // Handle expressions like 1,2/1+2,2+3/@1-2 and 1,2/1+2,2+3/@1-2,@all
        // (single beat expression mapping to multiple staves/measures)
        let s = staffIdx
        m = measureIdx
        if (this._beatRanges.length === 1) {
          m = 0
        }
        if (this._beatRanges[m].length === 1) {
          s = 0
        }
        // Resolve beats
        // Pass the beat (time) data specific to the measure
        const beatCount = Object.keys(this.docInfo.beats).reduce((count: number, changeAtMeasure) => {
          const changeNum = parseInt(changeAtMeasure, 10)
          if (requestedMeasure - 1 >= changeNum) {
            count = this.docInfo.beats[changeNum].count
          }
          return count
        }, 0)
        selectedStaves.add({
          emaIdx: requestedStaff,
          selection: this._beatRanges[m][s].map(b => b.resolveRangeTokens(beatCount))
        })
      })
      selection.add({
        emaIdx: requestedMeasure,
        selection: selectedStaves
      })
    })
    return selection
  }

}

