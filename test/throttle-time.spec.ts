import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import throttleTime from '../src/throttle-time'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

describe('[ throttleTime ]', () => {
  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = fn()
    const r = readable({ eager: false, delayMs: 10, log: readableLog })({ objectMode: true })(data)
    const t = throttleTime({ objectMode: true })(20)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [1], [3], [5], [7],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('always return last value', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = readable({ eager: true, delayMs: 0, log: readableLog })({ objectMode: true })(data)
    const t = throttleTime({ objectMode: true })(10)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [3],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
