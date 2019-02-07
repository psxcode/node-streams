import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import take from '../src/take'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

describe('[ take ]', () => {
  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = fn()
    const r = readable({ eager: false, delayMs: 10, log: readableLog })({ objectMode: true })(data)
    const t = take({ objectMode: true })(3)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [0], [1], [2],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('take last', async () => {
    const data = makeNumbers(8)
    const spy = fn()
    const r = readable({ eager: false, delayMs: 10, log: readableLog })({ objectMode: true })(data)
    const t = take({ objectMode: true })(-3)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [5], [6], [7],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('take zero', async () => {
    const data = makeNumbers(8)
    const spy = fn()
    const r = readable({ eager: false, delayMs: 10, log: readableLog })({ objectMode: true })(data)
    const t = take({ objectMode: true })(0)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('take positive overflow', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = readable({ eager: false, delayMs: 10, log: readableLog })({ objectMode: true })(data)
    const t = take({ objectMode: true })(16)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [3],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('take negative overflow', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = readable({ eager: false, delayMs: 10, log: readableLog })({ objectMode: true })(data)
    const t = take({ objectMode: true })(-16)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [3],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('should handle null and undefined', async () => {
    const data = [null, undefined]
    const spy = fn()
    const r = readable({ eager: false, delayMs: 10, log: readableLog })({ objectMode: true })(data)
    const t = take({ objectMode: true })(2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [undefined], [undefined],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })
})
