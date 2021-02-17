// tslint:disable: no-unused-expression
import { expect } from 'chai'
import EmaExp from '../src/EmaExp'
import EmaRange from '../src/EmaRange'
import EmaStaffRange from '../src/EmaStaffRange'
import EmaBeatRange from '../src/EmaBeatRange'

const docInfo = {
  measures: 4,
  staves: {0: ['Soprano', 'Alto', 'Tenor', 'Bass'] },
  beats: {0: {'count': 6, 'unit': 8} }
}

const docInfoComplex = {
  measures: 10,
  staves: {
    0: ['Soprano', 'Alto', 'Tenor', 'Bass'],
    5: ['Soprano', 'Alto', 'Tenor']
  },
  beats : {
    0: {'count': 6, 'unit': 8},
    5: {'count': 4, 'unit': 4}
  }
}

describe('EMA expression parser', () => {
  it('should parse an EMA range from string', () => {
    const range: EmaRange = EmaRange.parseRange('1-2')
    expect(range.start).equal(1)
    expect(range.end).equal(2)
    expect(range.toString()).equal('[1 2]')
  })

  it('should parse an EMA Staff range from string (non-beat)', () => {
    const range: EmaStaffRange = EmaStaffRange.parseRange('1-2')
    expect(range.start).equal(1)
    expect(range.end).equal(2)
    expect(range.toString()).equal('[1 2]')
  })

  it('should parse an EMA range from string (beat)', () => {
    const range: EmaBeatRange = EmaBeatRange.parseRange('1.33-2.999')
    expect(range.start).equal(1.33)
    expect(range.end).equal(2.999)
    expect(range.toString()).equal('[1.33 2.999]')
  })

  it('should parse an EMA range from string (shorthand)', () => {
    const range: EmaRange = EmaRange.parseRange('start-end')
    expect(range.start).equal('start')
    expect(range.end).equal('end')
    expect(range.toString()).equal('[start end]')
  })

  it('should parse a simple expression', () => {
    const exp: EmaExp = EmaExp.fromString(docInfo, '1/2/@3/cut')
    expect(exp.measures).equal('1')
    expect(exp.staves).equal('2')
    expect(exp.beats).equal('@3')
    expect(exp.completeness).equal('cut')
  })

  it('should parse a simple expression with shorthands', () => {
    const exp: EmaExp = EmaExp.fromString(docInfo, '2-end/start-2/@all/cut')
    expect(exp.measures).equal('2-end')
    expect(exp.staves).equal('start-2')
    expect(exp.beats).equal('@all')
    expect(exp.completeness).equal('cut')
  })

  it('should parse an expression with complex staff', () => {
    const exp: EmaExp = EmaExp.fromString(docInfo, '1-3/2,1+3,3-4/@all')
    // Get measure 1, staff 2 but not 1
    expect(exp.selection.getMeasure(1).getStaff(1)).to.be.undefined
    expect(exp.selection.getMeasure(1).getStaff(2)).exist
    // Get measure 2, staff 1 and 3 but not 2
    expect(exp.selection.getMeasure(2).getStaff(1)).exist
    expect(exp.selection.getMeasure(2).getStaff(2)).to.be.undefined
    expect(exp.selection.getMeasure(2).getStaff(3)).exist
    // Get measure 3, staff 4
    expect(exp.selection.getMeasure(3).getStaff(4)).exist
  })

  it('should parse an expression with complex beat ranges', () => {
    const exp: EmaExp = EmaExp.fromString(docInfo, '1-3/1-2,2-3,4/@1-2+@1-2,@2-3+@2-3,@1-2@4/cut')
    // Get measure 1, staff 1, start of only beat range
    expect(exp.selection.getMeasure(1).getStaff(1)[0].start).equal(1)
    // Get measure 2, staff 1 -> undefined
    expect(exp.selection.getMeasure(2).getStaff(1)).to.be.undefined
    // Get measure 2, staff 3, end of only beat range
    expect(exp.selection.getMeasure(2).getStaff(3)[0].end).equal(3)
    // Get measure 3, staff 4, start of second beat range
    expect(exp.selection.getMeasure(3).getStaff(4)[1].end).equal(4)
  })

  it('should parse an expression with multiple ranges', () => {
    const exp: EmaExp = EmaExp.fromString(docInfo, '1,3-4/all/@all/cut')
    // Get measure 1, staff 1, start of only beat range
    expect(exp.selection.getMeasure(1).getStaff(1)[0].start).equal(1)
    // Get measure 2 -> undefined
    expect(exp.selection.getMeasure(2)).to.be.undefined
    // Get measure 3, staff 1, start of only beat range
    expect(exp.selection.getMeasure(3).getStaff(1)[0].start).equal(1)
  })

  it('should parse an expression with ranges and shorthands', () => {
    const exp: EmaExp = EmaExp.fromString(docInfo, 'all/1-2,2-3,1,1/@1-2+@1-2,@2-end+@2-end,@1-2@4,@all/cut')
    // Get measure 1, staff 1, start of only beat range
    expect(exp.selection.getMeasure(1).getStaff(1)[0].start).equal(1)
    // Get measure 2, staff 1 -> undefined
    expect(exp.selection.getMeasure(2).getStaff(1)).to.be.undefined
    // Get measure 2, staff 3, end of only beat range
    expect(exp.selection.getMeasure(2).getStaff(3)[0].end).equal(7)
    // Get measure 3, staff 1, start of second beat range
    expect(exp.selection.getMeasure(3).getStaff(1)[1].end).equal(4)
  })

  it('should parse an expression with ranges, shorthands, and simplifications', () => {
    const exp: EmaExp = EmaExp.fromString(docInfo, 'all/1-2/@all/cut')
    // Get measure 1, staff 1, start of beat range
    expect(exp.selection.getMeasure(1).getStaff(1)[0].start).equal(1)
    // Get measure 2, staff 1, end of beat range
    expect(exp.selection.getMeasure(2).getStaff(1)[0].end).equal(7)
    // Get measure 5 -> undefined
    expect(exp.selection.getMeasure(5)).to.be.undefined
  })

  it('should reject a request for non-existing measure', () => {
    expect(() => EmaExp.fromString(docInfo, '10/1-2/@all/cut')).to.throw(Error, 'EMA Range out of bounds')
  })

  it('should parse an expression with staff and beat changes', () => {
    // change at measure 6.
    const exp: EmaExp = EmaExp.fromString(docInfoComplex, '1-8/all/@all')
    // Get measure 1, staff 4, start of beat range
    expect(exp.selection.getMeasure(1).getStaff(4)[0].start).equal(1)
    // Get measure 1, staff 4, end of beat range
    expect(exp.selection.getMeasure(1).getStaff(4)[0].end).equal(7)
    // Get measure 7, staff 3, end of beat range
    expect(exp.selection.getMeasure(7).getStaff(3)[0].end).equal(5)
    // Get measure 7, staff 4 -> undefined
    expect(exp.selection.getMeasure(7).getStaff(4)).to.be.undefined
  })

  it('should reject an expression that does not match staff changes', () => {
    expect(() => EmaExp.fromString(docInfoComplex, '1-8/1-4/@all')).to.throw(Error, 'EMA Range out of bounds')
  })

  it('should parse an expression with staff and beat changes', () => {
    // change at measure 6.
    const exp: EmaExp = EmaExp.fromString(docInfoComplex, '1-8/1-4,1-4,1-4,1-4,1-4,1-3,1-3,1-3/@all')
    // Get measure 1, staff 4, start of beat range
    expect(exp.selection.getMeasure(1).getStaff(4)[0].start).equal(1)
    // Get measure 1, staff 4, end of beat range
    expect(exp.selection.getMeasure(1).getStaff(4)[0].end).equal(7)
    // Get measure 7, staff 3, end of beat range
    expect(exp.selection.getMeasure(7).getStaff(3)[0].end).equal(5)
    // Get measure 7, staff 4 -> undefined
    expect(exp.selection.getMeasure(7).getStaff(4)).to.be.undefined
  })
})