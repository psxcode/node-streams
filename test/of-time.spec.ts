import { Readable } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import ofTime from '../src/of-time'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

const writableLog = debug('ns:writable')
const destroyFn = (stream: Readable) => () => stream.destroy()

describe('[ ofTime ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = fn()
    const r = ofTime({ objectMode: true })(30)(...data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(r, w)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [3],
    ])
    expect(numEvents(r, w)).eq(0)
  })

  it('should handle null and undefined', async () => {
    const data = [null, undefined]
    const spy = fn()
    const r = ofTime({ objectMode: true })(10)(...data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(r, w)

    expect(spy.calls).deep.eq([
      [undefined], [undefined],
    ])
    expect(numEvents(r, w)).eq(0)
  })

  it('should handle destroy', async () => {
    const data = makeNumbers(4)
    const r = ofTime({ objectMode: true })(30)(...data)
    const spy = fn(destroyFn(r))
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(r, w)

    expect(spy.calls).deep.eq([
      [0],
    ])
    expect(numEvents(r, w)).eq(0)
  })
})
