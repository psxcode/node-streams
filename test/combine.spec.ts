import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import combine from '../src/combine'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

let i = 0
const readableLog = () => debug(`ns:readable:${i++}`)
const writableLog = debug('ns:writable')

describe('[ combine ]', () => {
  it('lazy readables', async () => {
    const data = makeNumbers(3)
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 12, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const s3 = readable({ eager: false, delayMs: 8, log: readableLog() })({ objectMode: true })(data)
    const r = combine({ objectMode: true })(s1, s2, s3)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [[undefined, undefined, 0]],
      [[undefined, 0, 0]],
      [[0, 0, 0]],
      [[0, 0, 1]],
      [[0, 1, 1]],
      [[1, 1, 1]],
      [[1, 1, 2]],
      [[1, 2, 2]],
      [[2, 2, 2]],
    ])
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(s3)).eq(0)
    expect(numEvents(r)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('readable emits error', async () => {
    const data = makeNumbers(2)
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 0, log: readableLog(), errorAtStep: 1 })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 0, log: readableLog() })({ objectMode: true })(data)
    const r = combine({ objectMode: true })(s1, s2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    /* error is not propagated by pipe */
    r.on('error', () => {})

    await finished(p)

    expect(spy.calls).deep.eq([
      [[0, undefined]],
      [[0, 0]],
      [[0, 1]],
    ])
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(r)).eq(1)
    expect(numEvents(w)).eq(0)
  })

  it('no readables', async () => {
    const spy = fn()
    const r = combine({ objectMode: true })()
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([])
    expect(numEvents(r)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('should handle null and undefined', async () => {
    const data = [null, undefined]
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 12, log: readableLog() })({ objectMode: true })(data)
    const r = combine({ objectMode: true })(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [[undefined]],
      [[undefined]],
    ])
    expect(numEvents(s1)).eq(0)
    expect(numEvents(r)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
