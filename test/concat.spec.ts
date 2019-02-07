import { Readable } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import concat from '../src/concat'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

let i = 0
const readableLog = () => debug(`ns:readable:${i++}`)
const consumerLog = debug('ns:consumer')
const destroyFn = (stream: Readable) => () => stream.destroy()

describe('[ concat ]', () => {
  it('should work', async () => {
    const data = makeNumbers(3)
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: true, log: readableLog() })({ objectMode: true })(data)
    const r = concat({ objectMode: true })(s1, s2)
    const w = writable({ log: consumerLog })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(s1, s2, r, w)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [0], [1], [2],
    ])
    expect(numEvents(s1, s2, r, w)).eq(0)
  })

  it('readable emits error', async () => {
    const data = makeNumbers(3)
    const spy = fn()
    const errorSpy = fn(debug('ns:error'))
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog(), errorAtStep: 1 })({ objectMode: true })(data)
    const s2 = readable({ eager: true, log: readableLog() })({ objectMode: true })(data)
    const r = concat({ objectMode: true })(s1, s2)
    const w = writable({ log: consumerLog })({ objectMode: true })(spy)
    r.pipe(w)

    r.once('error', errorSpy)

    await finished(s1, s2, r, w)

    expect(spy.calls).deep.eq([
      [0], [0], [1], [2],
    ])
    expect(numEvents(s1, s2, r, w)).eq(0)
  })

  it('no readables', async () => {
    const spy = fn()
    const r = concat({ objectMode: true })()
    const w = writable({ log: consumerLog })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(r, w)

    expect(spy.calls).deep.eq([])
    expect(numEvents(r, w)).eq(0)
  })

  it('should handle null and undefined', async () => {
    const data = [null, undefined]
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog() })({ objectMode: true })(data)
    const r = concat({ objectMode: true })(s1)
    const w = writable({ log: consumerLog })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(s1, r, w)

    expect(spy.calls).deep.eq([
      [undefined], [undefined],
    ])
    expect(numEvents(s1, r, w)).eq(0)
  })

  it('should handle destroy', async () => {
    const data = makeNumbers(4)
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog() })({ objectMode: true })(data)
    const r = concat({ objectMode: true })(s1)
    const spy = fn(destroyFn(r as Readable))
    const w = writable({ log: consumerLog })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(s1, r, w)

    expect(spy.calls).deep.eq([
      [0],
    ])
    expect(numEvents(s1, r, w)).eq(0)
  })
})
