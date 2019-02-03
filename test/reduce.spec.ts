import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import reduce from '../src/reduce'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'
import errorMessage from './error-message'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

const addAll = (acc = 0, value: number) => acc + value
const errorFn = (acc: any, value: any) => {
  throw new Error('error in reducer')
}

describe('[ reduce ]', () => {
  it('should work', async () => {
    const data = makeNumbers(3)
    const spy = fn()
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const t = reduce({ objectMode: true })(addAll)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [3],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('should work with null', async () => {
    const data = [null, undefined]
    const spy = fn()
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const t = reduce({ objectMode: true })(() => null)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [undefined],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('should work with undefined', async () => {
    const data = [null, undefined]
    const spy = fn()
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const t = reduce({ objectMode: true })(() => undefined)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [undefined],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('error in reducer', async () => {
    const data = makeNumbers(3)
    const spy = fn(debug('ns:sink'))
    const errorSpy = fn(debug('ns:error'))
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const t = reduce({ objectMode: true })(errorFn)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
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
      ['error in reducer'],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(3)
    expect(numEvents(w)).eq(3)
  })
})
