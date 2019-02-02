import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import filter from '../src/filter'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

const isEven = (value: number) => value % 2 === 0

describe('[ filter ]', () => {
  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = fn(() => {})
    const r = readable({ eager: false, delayMs: 0, log: readableLog })({ objectMode: true })(data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const t = filter({ objectMode: true })(isEven)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [0],
      [2],
      [4],
      [6],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
