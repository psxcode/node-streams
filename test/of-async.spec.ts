import { expect } from 'chai'
import { describe, it } from 'mocha'
import { writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import ofAsync from '../src/of-async'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import interval from './interval'
import numEvents from './num-events'

const writableLog = debug('ns:writable')

describe('[ ofAsync ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = ofAsync({ objectMode: true })(interval(30))(...data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [3],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('should handle null and undefined', async () => {
    const data = [null, undefined]
    const spy = fn()
    const r = ofAsync({ objectMode: true })(interval(10))(...data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [undefined], [undefined],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
