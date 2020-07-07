import EmaBeatRange from './EmaBeatRange'

export type Selection = {
  emaIdx: number
  selection: EmaSelection | EmaBeatRange[]
}

export default class EmaSelection {
  contents: Selection[]
  constructor(contents: Selection[]) {
    this.contents = contents
  }

  add(s: Selection): void {
    this.contents.push(s)
  }

  getSelection(i: number): EmaSelection | EmaBeatRange[] {
    const s = this.contents.filter(c => c.emaIdx === i)[0]
    if (s) {
      return s.selection
    }
  }

  getMeasure(i: number): EmaSelection {
    const s = this.getSelection(i)
    if (s instanceof EmaSelection) {
      return s
    }
  }

  getStaff(i: number): EmaBeatRange[] {
    const s = this.getSelection(i)
    if (s instanceof Array) {
      if (s[0] instanceof EmaBeatRange) {
        return s
      }
    }
  }
}