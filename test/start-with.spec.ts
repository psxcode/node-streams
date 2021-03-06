import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import startWith from '../src/start-with'
import finished from './stream-finished'
import numEvents from './num-events'

let i = 0
const readableLog = () => debug(`ns:readable:${i++}`)
const writableLog = debug('ns:writable')

describe('[ concat ]', () => {
  it('should work', async () => {
    const data = [3, 4]
    const spy = fn()
    const s1 = readable({ eager: true, delayMs: 50, log: readableLog() })({ objectMode: true })(data)
    const r = startWith({ objectMode: true })(0, 1, 2)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(s1, r, w)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [3], [4],
    ])
    expect(numEvents(s1, r, w)).eq(0)
  })
})
