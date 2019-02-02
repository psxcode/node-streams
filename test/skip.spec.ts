import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import skip from '../src/skip'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

describe('[ skip ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = fn(() => {})
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const t = skip({ objectMode: true })(2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [2], [3],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
