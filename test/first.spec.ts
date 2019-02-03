import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import filter from '../src/filter'
import first from '../src/first'
import map from '../src/map'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

const isEqual = (value: number) => (arg: number) => value === arg
const multiply = (multiplier: number) => (value: number) => value * multiplier

describe('[ first ]', () => {
  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = fn()
    const r = readable({ eager: false, delayMs: 0, log: readableLog })({ objectMode: true })(data)
    const t = first({ objectMode: true })
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(t).pipe(w)

    /* wait for readable */
    await finished(r)

    expect(spy.calls).deep.eq([
      [0],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
