import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import filter from '../src/filter'
import pluck from '../src/pluck'
import map from '../src/map'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

const isEqual = (value: number) => (arg: number) => value === arg
const multiply = (multiplier: number) => (value: number) => value * multiplier
const makeNumbers = (length: number): Iterable<{ value: number }> => ({
  * [Symbol.iterator] () {
    for (let i = 0; i < length; ++i) {
      yield { value: i }
    }
  },
})

describe('[ pluck ]', () => {
  it('should work', async () => {
    const data = makeNumbers(3)
    const spy = fn(() => {})
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r
      .pipe(pluck({ objectMode: true })('value'))
      .pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [0], [1], [2],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
