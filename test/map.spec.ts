import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import map from '../src/map'
import makeNumbers from './make-numbers'
import makeStrings from './make-strings'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

const multiply = (multiplier: number) => (value: number) => value * multiplier

describe('[ map ]', () => {
  it('should work', async () => {
    const data = makeNumbers(6)
    const spy = fn()
    const r = readable({ eager: true, log: readableLog })({ encoding: 'utf8' })(data)
    const w = writable({ log: writableLog })({ decodeStrings: false })(spy)
    const t = map({ objectMode: true })(multiply(2))
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [0], [2], [4], [6],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
