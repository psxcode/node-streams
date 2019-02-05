import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import merge from '../src/merge'
import finished from './stream-finished'
import numEvents from './num-events'
import makeNumbers from './make-numbers'
import errorMessage from './error-message'

let i = 0
const readableLog = () => debug(`ns:readable:${i++}`)
const writableLog = debug('ns:writable')

describe('[ merge ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 13, log: readableLog() })({ objectMode: true })(data)
    const r = merge({ objectMode: true })(s1, s2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [0], [0], [1], [1], [2], [2], [3], [3],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('no readables', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = merge({ objectMode: true })()
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([])
    expect(numEvents(r)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('should handle one readable', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const r = merge({ objectMode: true })(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [3],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('should handle error / error break', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const errorSpy = fn(debug('ns:error'))
    const s1 = readable({ eager: false, delayMs: 10, log: readableLog(), errorAtStep: 0 })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 13, log: readableLog() })({ objectMode: true })(data)
    const r = merge({ objectMode: true })(s1, s2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    /* handle error */
    r.on('error', errorSpy)

    await finished(p)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [3],
    ])
    expect(errorSpy.calls.map(errorMessage)).deep.eq([
      ['error at 0'],
    ])
    expect(numEvents(r)).eq(1)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('should handle error / error continue', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const errorSpy = fn()
    const s1 = readable({ eager: false, delayMs: 10, log: readableLog(), errorAtStep: 0, continueOnError: true })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 13, log: readableLog() })({ objectMode: true })(data)
    const r = merge({ objectMode: true })(s1, s2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    r.on('error', errorSpy)

    await finished(p)

    expect(spy.calls).deep.eq([
      [0], [0], [1], [1], [2], [2], [3], [3],
    ])
    expect(errorSpy.calls.map(errorMessage)).deep.eq([
      ['error at 0'],
    ])
    expect(numEvents(r)).eq(1)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('should handle null and undefined', async () => {
    const data = [null, undefined]
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const r = merge({ objectMode: true })(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [undefined], [undefined],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
