import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import pipe from '../src/pipe'
import filter from '../src/filter'
import map from '../src/map'
import first from '../src/first'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

const isEqual = (value: number) => (arg: number) => value === arg
const multiply = (multiplier: number) => (value: number) => value * multiplier

describe('[ pipe ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const t0 = filter({ objectMode: true })(isEqual(2))
    const t1 = first({ objectMode: true })
    const t2 = map({ objectMode: true })(multiply(2))
    const piped = pipe(
      t0,
      pipe(
        t1,
        t2
      )
    )
    r.pipe(piped[0])
    piped[2].pipe(w)

    await finished(r, w, t0, t1, t2)

    expect(spy.calls).deep.eq([
      [4],
    ])
    expect(numEvents(r, w, t0, t1, t2)).eq(0)
  })
})
