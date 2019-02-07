import { Readable } from 'stream'
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
const destroyFn = (stream: Readable) => () => stream.destroy()

describe('[ withLatest ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 18, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const s3 = readable({ eager: false, delayMs: 6, log: readableLog() })({ objectMode: true })(data)
    const r = withLatest({ objectMode: true })(s2, s3)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(s1, s2, s3, r, w)

    expect(spy.calls).deep.eq([
      [[0, 0, 1]],
      [[1, 2, 3]],
      [[2, 3, 3]],
      [[3, 3, 3]],
    ])
    expect(numEvents(s1, s2, s3, r, w)).eq(0)
  })

  it('long data secondary stream', async () => {
    const data = makeNumbers(2)
    const longerData = makeNumbers(8)
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 0, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 0, log: readableLog() })({ objectMode: true })(longerData)
    const r = withLatest({ objectMode: true })(s2)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(s1, s2, r, w)

    expect(spy.calls).deep.eq([
      [[0, undefined]],
      [[1, 0]],
    ])
    expect(numEvents(s1, s2, r, w)).eq(0)
  })

  it('no latest readables', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog() })({ objectMode: true })(data)
    const r = withLatest({ objectMode: true })()(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(s1, r, w)

    expect(spy.calls).deep.eq([
      [[0]],
      [[1]],
      [[2]],
      [[3]],
    ])
    expect(numEvents(s1, r, w)).eq(0)
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
    r.pipe(w)

    /* handle error */
    r.once('error', errorSpy)

    await finished(s1, s2, s3, r, w)

    expect(spy.calls).deep.eq([])
    expect(errorSpy.calls.map(errorMessage)).deep.eq([
      ['error at 0'],
    ])
    expect(numEvents(s1, s2, s3, r, w)).eq(0)
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
    r.pipe(w)

    /* handle error */
    r.once('error', errorSpy)

    await finished(s1, s2, s3, r, w)

    expect(spy.calls).deep.eq([
      [[0, 0, 1]],
      [[1, 2, 3]],
      [[2, 3, 3]],
      [[3, 3, 3]],
    ])
    expect(numEvents(s1, s2, s3, r, w)).eq(0)
  })

  it('should handle error on \'latest\' stream / error break', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const errorSpy = fn(debug('ns:error'))
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog(), errorAtStep: 0 })({ objectMode: true })(data)
    const r = withLatest({ objectMode: true })(s2)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(w)

    /* handle error */
    s2.once('error', errorSpy)

    await finished(s1, s2, r, w)

    expect(spy.calls).deep.eq([
      [[0, undefined]],
      [[1, undefined]],
      [[2, undefined]],
      [[3, undefined]],
    ])
    expect(errorSpy.calls.map(errorMessage)).deep.eq([
      ['error at 0'],
    ])
    expect(numEvents(s1, s2, r, w)).eq(0)
  })

  it('should handle error on \'latest\' stream / error continue', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const errorSpy = fn(debug('ns:error'))
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog(), errorAtStep: 0, continueOnError: true })({ objectMode: true })(data)
    const r = withLatest({ objectMode: true })(s2)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(w)

    /* handle error */
    s2.once('error', errorSpy)

    await finished(s1, s2, r, w)

    expect(spy.calls).deep.eq([
      [[0, 0]],
      [[1, 2]],
      [[2, 3]],
      [[3, 3]],
    ])
    expect(errorSpy.calls.map(errorMessage)).deep.eq([
      ['error at 0'],
    ])
    expect(numEvents(s1, s2, r, w)).eq(0)
  })

  it('should handle null and undefined', async () => {
    const data = [null, undefined]
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const r = withLatest({ objectMode: true })()(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(s1, r, w)

    expect(spy.calls).deep.eq([
      [[undefined]],
      [[undefined]],
    ])
    expect(numEvents(s1, r, w)).eq(0)
  })

  it('should handle destroy of support stream', async () => {
    const data = makeNumbers(4)
    const s1 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 5, log: readableLog() })({ objectMode: true })(data)
    const spy = fn(destroyFn(s2))
    const r = withLatest({ objectMode: true })(s2)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(s1, s2, r, w)

    expect(spy.calls).deep.eq([
      [[0, 0]],
      [[1, 0]],
      [[2, 0]],
      [[3, 0]],
    ])
    expect(numEvents(s1, s2, r, w)).eq(0)
  })

  it('should handle destroy of main stream', async () => {
    const data = makeNumbers(4)
    const s1 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 5, log: readableLog() })({ objectMode: true })(data)
    const spy = fn(destroyFn(s1))
    const r = withLatest({ objectMode: true })(s2)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(s1, s2, r, w)

    expect(spy.calls).deep.eq([
      [[0, 0]],
    ])
    expect(numEvents(s1, s2, r, w)).eq(0)
  })

  it('should handle destroy', async () => {
    const data = makeNumbers(4)
    const s1 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 5, log: readableLog() })({ objectMode: true })(data)
    const r = withLatest({ objectMode: true })(s2)(s1)
    const spy = fn(destroyFn(r))
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(s1, s2, r, w)

    expect(spy.calls).deep.eq([
      [[0, 0]],
    ])
    expect(numEvents(s1, s2, r, w)).eq(0)
  })
})
