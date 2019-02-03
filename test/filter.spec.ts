import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import filter from '../src/filter'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'
import errorMessage from './error-message'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

const isEven = (value: number) => value % 2 === 0
const errorFn = (value: any) => {
  throw new Error('error in predicate')
}

describe('[ filter ]', () => {
  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = fn()
    const r = readable({ eager: false, delayMs: 0, log: readableLog })({ objectMode: true })(data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const t = filter({ objectMode: true })(isEven)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [0], [2], [4], [6],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('error in predicate', async () => {
    const data = makeNumbers(8)
    const spy = fn()
    const errorSpy = fn(debug('ns:error'))
    const r = readable({ eager: false, delayMs: 0, log: readableLog })({ objectMode: true })(data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const t = filter({ objectMode: true })(errorFn)
    const p = r.pipe(t).pipe(w)

    /* handle error */
    t.on('error', (e) => {
      errorSpy(e)
      /* force readable to emit 'end' event */
      r.resume()
    })

    await finished(r)

    expect(spy.calls).deep.eq([])
    expect(errorSpy.calls.map(errorMessage)).deep.eq([
      ['error in predicate'],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(3)
    expect(numEvents(w)).eq(3)
  })

  it('should handle null and undefined', async () => {
    const data = [null, undefined]
    const spy = fn()
    const r = readable({ eager: false, delayMs: 0, log: readableLog })({ objectMode: true })(data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const t = filter({ objectMode: true })(() => true)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [undefined], [undefined],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
