import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import zip from '../src/zip'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'
import errorMessage from './error-message'

let i = 0
const readableLog = () => debug(`ns:readable:${i++}`)
const writableLog = debug('ns:writable')

describe('[ zip ]', () => {
  it('should work', async () => {
    const d1 = makeNumbers(3)
    const d2 = [0, 1, 2, 3, 4, 5, 6]
    const spy = fn()
    const s1 = readable({ eager: true, delayMs: 0, log: readableLog() })({ objectMode: true })(d1)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(d2)
    const r = zip({ objectMode: true })(s1, s2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    /* wait for longer running stream */
    await finished(s2)

    expect(spy.calls).deep.eq([
      [[0, 0]],
      [[1, 1]],
      [[2, 2]],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('empty streams', async () => {
    const d1 = makeNumbers(0)
    const d2 = []
    const spy = fn()
    const s1 = readable({ eager: true, delayMs: 0, log: readableLog() })({ objectMode: true })(d1)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(d2)
    const r = zip({ objectMode: true })(s1, s2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    /* wait for longer running stream */
    await finished(s2)

    expect(spy.calls).deep.eq([])
    expect(numEvents(r)).eq(0)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('no readables', async () => {
    const d1 = makeNumbers(3)
    const d2 = [0, 1, 2, 3, 4, 5, 6]
    const spy = fn()
    const r = zip({ objectMode: true })()
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([])
    expect(numEvents(r)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('should handle null and undefined', async () => {
    const d1 = [null]
    const d2 = [undefined]
    const spy = fn()
    const s1 = readable({ eager: true, delayMs: 0, log: readableLog() })({ objectMode: true })(d1)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(d2)
    const r = zip({ objectMode: true })(s1, s2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(r)

    expect(spy.calls).deep.eq([
      [[undefined, undefined]],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('should handle error / error break', async () => {
    const d1 = makeNumbers(3)
    const d2 = [0, 1, 2, 3, 4, 5, 6]
    const spy = fn()
    const errorSpy = fn(debug('ns:error'))
    const s1 = readable({ eager: true, delayMs: 0, log: readableLog(), errorAtStep: 1 })({ objectMode: true })(d1)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(d2)
    const r = zip({ objectMode: true })(s1, s2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    r.on('error', errorSpy)

    /* wait for longer running stream */
    await finished(s2)

    expect(spy.calls).deep.eq([
      [[0, 0]],
    ])
    expect(errorSpy.calls.map(errorMessage)).deep.eq([
      ['error at 1'],
    ])
    expect(numEvents(r)).eq(1)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('should handle error / error continue', async () => {
    const d1 = makeNumbers(3)
    const d2 = [0, 1, 2, 3, 4, 5, 6]
    const spy = fn()
    const errorSpy = fn(debug('ns:error'))
    const s1 = readable({ eager: true, delayMs: 0, log: readableLog(), errorAtStep: 1, continueOnError: true })({ objectMode: true })(d1)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(d2)
    const r = zip({ objectMode: true })(s1, s2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    /* handle error */
    r.on('error', errorSpy)

    /* wait for longer running stream */
    await finished(s2)

    expect(spy.calls).deep.eq([
      [[0, 0]],
      [[1, 1]],
      [[2, 2]],
    ])
    expect(errorSpy.calls.map(errorMessage)).deep.eq([
      ['error at 1'],
    ])
    expect(numEvents(r)).eq(1)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
