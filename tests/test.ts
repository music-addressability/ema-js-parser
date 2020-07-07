// tslint:disable: no-unused-expression
import { expect } from 'chai'
import * as EmaExp from '../src/EmaExp'
import * as EmaRange from '../src/EmaRange'
import * as EmaStaffRange from '../src/EmaStaffRange'
import * as EmaBeatRange from '../src/EmaBeatRange'

const docInfo = {
  measures: 4,
  staves: {0 : ['Soprano', 'Alto', 'Tenor', 'Bass'] },
  beats : {0 : {'count': 6, 'unit': 8} }
}

const docInfoComplex = {
  measures: 4,
  staves: {
    0 : ['Soprano', 'Alto', 'Tenor', 'Bass'],
    5: ['Soprano', 'Alto', 'Tenor']
  },
  beats : {0 : {'count': 6, 'unit': 8} }
}

describe('EMA expression parser', () => {
  it('should parse an EMA range from string', () => {
    const range = EmaRange.fromString('1-2')
    expect(range.start).equal(1)
    expect(range.end).equal(2)
    expect(range.toString()).equal('[1 2]')
  })

  it('should parse an EMA Staff range from string (non-beat)', () => {
    const range = EmaStaffRange.fromString('1-2')
    expect(range.start).equal(1)
    expect(range.end).equal(2)
    expect(range.toString()).equal('[1 2]')
  })

  it('should parse an EMA range from string (beat)', () => {
    const range = EmaBeatRange.fromString('1.33-2.999')
    expect(range.start).equal(1.33)
    expect(range.end).equal(2.999)
    expect(range.toString()).equal('[1.33 2.999]')
  })

  it('should parse an EMA range from string (shorthand)', () => {
    const range = EmaRange.fromString('start-end')
    expect(range.start).equal('start')
    expect(range.end).equal('end')
    expect(range.toString()).equal('[start end]')
  })

  it('should parse a simple expression', () => {
    const exp = EmaExp.fromString(docInfo, '1/2/@3/cut')
    expect(exp.measures).equal('1')
    expect(exp.staves).equal('2')
    expect(exp.beats).equal('@3')
    expect(exp.completeness).equal('cut')
  })

  it('should parse a simple expression with shorthands', () => {
    const exp = EmaExp.fromString(docInfo, '2-end/start-2/@all/cut')
    expect(exp.measures).equal('2-end')
    expect(exp.staves).equal('start-2')
    expect(exp.beats).equal('@all')
    expect(exp.completeness).equal('cut')
  })

  it('should parse an expression with ranges', () => {
    const exp = EmaExp.fromString(docInfo, '1-3/1-2,2-3,1/@1-2+@1-2,@2-3+@2-3,@1-2@4/cut')
    // Get measure 1, staff 1, start of only beat range
    expect(exp.selection.getMeasure(1).getStaff(1)[0].start).equal(1)
    // Get measure 2, staff 1 -> undefined
    expect(exp.selection.getMeasure(2).getStaff(1)).to.be.undefined
    // Get measure 2, staff 3, end of only beat range
    expect(exp.selection.getMeasure(2).getStaff(3)[0].end).equal(3)
    // Get measure 3, staff 1, start of second beat range
    expect(exp.selection.getMeasure(3).getStaff(1)[1].end).equal(4)
  })

  it('should parse an expression with ranges and shorthands', () => {
    const exp = EmaExp.fromString(docInfo, 'all/1-2,2-3,1,1/@1-2+@1-2,@2-end+@2-end,@1-2@4,@all/cut')
    // Get measure 1, staff 1, start of only beat range
    expect(exp.selection.getMeasure(1).getStaff(1)[0].start).equal(1)
    // Get measure 2, staff 1 -> undefined
    expect(exp.selection.getMeasure(2).getStaff(1)).to.be.undefined
    // Get measure 2, staff 3, end of only beat range
    expect(exp.selection.getMeasure(2).getStaff(3)[0].end).equal('end')
    // Get measure 3, staff 1, start of second beat range
    expect(exp.selection.getMeasure(3).getStaff(1)[1].end).equal(4)
  })

  it('should parse an expression with ranges, shorthands, and simplifications', () => {
    const exp = EmaExp.fromString(docInfo, 'all/1-2/@all/cut')
    // Get measure 1, staff 1, start of beat range
    expect(exp.selection.getMeasure(1).getStaff(1)[0].start).equal(1)
    // Get measure 2, staff 1, end of beat range
    expect(exp.selection.getMeasure(2).getStaff(1)[0].end).equal('end')
    // Get measure 5 -> undefined
    expect(exp.selection.getMeasure(5)).to.be.undefined
  })

  // TODO add tests for staff number changes with `docInfoComplex`
})