import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import first from '../src/first'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

describe('[ first ]', () => {
  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = fn()
    const r = readable({ eager: false, delayMs: 0, log: readableLog })({ objectMode: true })(data)
    const t = first({ objectMode: true })
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [0],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('should handle null', async () => {
    const data = [null]
    const spy = fn()
    const r = readable({ eager: false, delayMs: 0, log: readableLog })({ objectMode: true })(data)
    const t = first({ objectMode: true })
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [undefined],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('should handle undefined', async () => {
    const data = [undefined]
    const spy = fn()
    const r = readable({ eager: false, delayMs: 0, log: readableLog })({ objectMode: true })(data)
    const t = first({ objectMode: true })
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [undefined],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })
})
