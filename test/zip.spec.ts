import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import zip from '../src/zip'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

let i = 0
const readableLog = () => debug(`ns:readable:${i++}`)
const writableLog = debug('ns:writable')

describe('[ zip ]', () => {
  it('should work', async () => {
    const d1 = makeNumbers(5)
    const d2 = [0, 1, 2, 3, 4, 5, 6]
    const spy = fn(() => {})
    const s1 = readable({ eager: true, delayMs: 30, log: readableLog() })({ objectMode: true })(d1)
    const s2 = readable({ eager: true, delayMs: 10, log: readableLog() })({ objectMode: true })(d2)
    const r = zip({ objectMode: true })(s1, s2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([])
    expect(numEvents(r)).eq(0)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
