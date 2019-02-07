import { describe, it } from 'mocha'
import { expect } from 'chai'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import debounce from '../src/debounce'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import interval from './interval'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

describe('[debounce]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = readable({ eager: true, delayMs: 0, log: readableLog })({ objectMode: true })(data)
    const t = debounce({ objectMode: true })(interval(30))
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [3],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('should handle null and undefined', async () => {
    const data = [null, undefined]
    const spy = fn()
    const r = readable({ eager: false, delayMs: 10, log: readableLog })({ objectMode: true })(data)
    const t = debounce({ objectMode: true })(interval(0))
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [undefined],
      [undefined],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })
})
