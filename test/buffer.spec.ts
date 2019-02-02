import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import buffer from '../src/buffer'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const consumerLog = debug('ns:consumer')

const interval = (ms: number) => (next: () => void) => {
  const id = setTimeout(next, ms)

  return () => {
    clearTimeout(id)
  }
}

describe('[ buffer ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = readable({ eager: false, delayMs: 10, log: readableLog })({ objectMode: true })(data)
    const t = buffer({ objectMode: true })(interval(15))
    const w = writable({ log: consumerLog })({ objectMode: true })(spy)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [[0, 1]],
      [[2, 3]],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('use transform \'flush\' function', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = readable({ eager: false, delayMs: 5, log: readableLog })({ objectMode: true })(data)
    const t = buffer({ objectMode: true })(interval(30))
    const w = writable({ log: consumerLog })({ objectMode: true })(spy)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [[0, 1, 2, 3]],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
