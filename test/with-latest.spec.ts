import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import withLatest from '../src/with-latest'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'
import errorMessage from './error-message'

let i = 0
const readableLog = () => debug(`ns:readable:${i++}`)
const writableLog = debug('ns:writable')

describe('[ withLatest ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const s3 = readable({ eager: false, delayMs: 7, log: readableLog() })({ objectMode: true })(data)
    const r = withLatest({ objectMode: true })(s2, s3)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [[0, 0, 1]],
      [[1, 2, 3]],
      [[2, 3, 3]],
      [[3, 3, 3]],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(s3)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('long data secondary stream', async () => {
    const data = makeNumbers(4)
    const longerData = makeNumbers(8)
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 0, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 0, log: readableLog() })({ objectMode: true })(longerData)
    const r = withLatest({ objectMode: true })(s2)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    /* wait for longer running stream */
    await finished(s2)

    expect(spy.calls).deep.eq([
      [[0, undefined]],
      [[1, 0]],
      [[2, 1]],
      [[3, 2]],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('no latest readables', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog() })({ objectMode: true })(data)
    const r = withLatest({ objectMode: true })()(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [[0]],
      [[1]],
      [[2]],
      [[3]],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('should handle error on main stream / error break', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const errorSpy = fn(debug('ns:error'))
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog(), errorAtStep: 0 })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const s3 = readable({ eager: false, delayMs: 7, log: readableLog() })({ objectMode: true })(data)
    const r = withLatest({ objectMode: true })(s2, s3)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    /* handle error */
    r.on('error', errorSpy)

    await finished(p)

    expect(spy.calls).deep.eq([])
    expect(errorSpy.calls.map(errorMessage)).deep.eq([
      ['error at 0'],
    ])
    expect(numEvents(r)).eq(1)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(s3)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('should handle error on main stream / error continue', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const errorSpy = fn(debug('ns:error'))
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog(), errorAtStep: 0, continueOnError: true })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const s3 = readable({ eager: false, delayMs: 7, log: readableLog() })({ objectMode: true })(data)
    const r = withLatest({ objectMode: true })(s2, s3)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    /* handle error */
    r.on('error', errorSpy)

    await finished(p)

    expect(spy.calls).deep.eq([
      [[0, 0, 1]],
      [[1, 2, 3]],
      [[2, 3, 3]],
      [[3, 3, 3]],
    ])
    expect(numEvents(r)).eq(1)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(s3)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('should handle error on \'latest\' stream / error break', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const errorSpy = fn(debug('ns:error'))
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog(), errorAtStep: 0 })({ objectMode: true })(data)
    const r = withLatest({ objectMode: true })(s2)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    /* handle error */
    s2.on('error', errorSpy)

    await finished(p)

    expect(spy.calls).deep.eq([
      [[0, undefined]],
      [[1, undefined]],
      [[2, undefined]],
      [[3, undefined]],
    ])
    expect(errorSpy.calls.map(errorMessage)).deep.eq([
      ['error at 0'],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(1)
    expect(numEvents(w)).eq(0)
  })

  it('should handle error on \'latest\' stream / error continue', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const errorSpy = fn(debug('ns:error'))
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog(), errorAtStep: 0, continueOnError: true })({ objectMode: true })(data)
    const r = withLatest({ objectMode: true })(s2)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    /* handle error */
    s2.on('error', errorSpy)

    await finished(p)

    expect(spy.calls).deep.eq([
      [[0, 0]],
      [[1, 2]],
      [[2, 3]],
      [[3, 3]],
    ])
    expect(errorSpy.calls.map(errorMessage)).deep.eq([
      ['error at 0'],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(1)
    expect(numEvents(w)).eq(0)
  })

  it('should handle null and undefined', async () => {
    const data = [null, undefined]
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const r = withLatest({ objectMode: true })()(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [[undefined]],
      [[undefined]],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
