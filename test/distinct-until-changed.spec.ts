import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import distinctUntilChanged from '../src/distinct-until-changed'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

describe('[ distinctUntilChanged ]', () => {
  it('should work', async () => {
    const data = [0, 1, 2, 2, 2, 3, 4, 4, 5, 5, 6, 7, 7, 8, 9, 9, 9]
    const spy = fn()
    const r = readable({ eager: true, delayMs: 30, log: readableLog })({ objectMode: true })(data)
    const t = distinctUntilChanged({ objectMode: true })
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [3], [4], [5], [6], [7], [8], [9],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('should handle null and undefined', async () => {
    const data = [null, undefined]
    const spy = fn()
    const r = readable({ eager: true, delayMs: 30, log: readableLog })({ objectMode: true })(data)
    const t = distinctUntilChanged({ objectMode: true })
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [undefined],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })
})
