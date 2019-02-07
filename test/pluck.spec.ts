import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import pluck from '../src/pluck'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

const makeNumbers = (length: number): Iterable<{ value: number }> => ({
  * [Symbol.iterator] () {
    for (let i = 0; i < length; ++i) {
      yield { value: i }
    }
  },
})

describe('[ pluck ]', () => {
  it('should work', async () => {
    const data = makeNumbers(3)
    const spy = fn()
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const t = pluck({ objectMode: true })('value')
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [0], [1], [2],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })

  it('not existing property', async () => {
    const data = makeNumbers(3)
    const spy = fn(debug('ns:sink'))
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const t = pluck({ objectMode: true })('not_existing')
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(t).pipe(w)

    await finished(r, t, w)

    expect(spy.calls).deep.eq([
      [undefined], [undefined], [undefined],
    ])
    expect(numEvents(r, t, w)).eq(0)
  })
})
