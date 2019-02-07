import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import scan from '../src/scan'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'
import errorMessage from './error-message'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

const addAll = (acc = 0, value: number) => acc + value
const errorFn = () => {
  throw new Error('error in reducer')
}

describe('[ scan ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const t = scan({ objectMode: true })(addAll)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [0], [1], [3], [6],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('should work with null', async () => {
    const data = makeNumbers(1)
    const spy = fn()
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const t = scan({ objectMode: true })(() => null)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [undefined],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('should work with undefined', async () => {
    const data = makeNumbers(1)
    const spy = fn()
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const t = scan({ objectMode: true })(() => undefined)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [undefined],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('error in reducer', async () => {
    const data = makeNumbers(4)
    const spy = fn(debug('ns:sink'))
    const errorSpy = fn(debug('ns:error'))
    const r = readable({ eager: false, log: readableLog })({ objectMode: true })(data)
    const t = scan({ objectMode: true })(errorFn)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    /* handle error */
    t.once('error', errorSpy)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([])
    expect(errorSpy.calls.map(errorMessage)).deep.eq([
      ['error in reducer'],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })
})
