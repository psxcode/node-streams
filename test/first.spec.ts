import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import filter from '../src/filter'
import first from '../src/first'
import map from '../src/map'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

const isEqual = (value: number) => (arg: number) => value === arg
const multiply = (multiplier: number) => (value: number) => value * multiplier

describe('[ first ]', () => {
  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(first({ objectMode: true })).pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })

  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r
      .pipe(filter({ objectMode: true })(isEqual(10)))
      .pipe(first({ objectMode: true }))
      .pipe(map({ objectMode: true })(multiply(2)))
      .pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
