import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import skip from '../src/skip'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

describe('[ skip ]', () => {
  it('skip first', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = readable({ eager: false, delayMs: 0, log: readableLog })({ objectMode: true })(data)
    const t = skip({ objectMode: true })(2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [2], [3],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('skip last', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = readable({ eager: false, delayMs: 0, log: readableLog })({ objectMode: true })(data)
    const t = skip({ objectMode: true })(-2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [0], [1],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('skip zero', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = readable({ eager: false, log: readableLog })({ objectMode: true })(data)
    const t = skip({ objectMode: true })(0)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [3],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('positive overflow', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = readable({ eager: false, log: readableLog })({ objectMode: true })(data)
    const t = skip({ objectMode: true })(8)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('negative overflow', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = readable({ eager: false, log: readableLog })({ objectMode: true })(data)
    const t = skip({ objectMode: true })(-8)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('should handle null and undefined', async () => {
    const data = [null, undefined]
    const spy = fn()
    const r = readable({ eager: false, log: readableLog })({ objectMode: true })(data)
    const t = skip({ objectMode: true })(0)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [undefined], [undefined],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })
})
