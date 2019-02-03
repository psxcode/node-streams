import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import side from '../src/side'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

describe('[ side ]', () => {
  it('shoudl work', async () => {
    const data = makeNumbers(3)
    const spy = fn()
    const sideSpy = fn()
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const t = side({ objectMode: true })(sideSpy)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [0], [1], [2],
    ])
    expect(sideSpy.calls).deep.eq([
      [0], [1], [2],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('shoudl work with null and undefined', async () => {
    const data = [null, undefined]
    const spy = fn()
    const sideSpy = fn()
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const t = side({ objectMode: true })(sideSpy)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(spy.calls).deep.eq([
      [undefined], [undefined],
    ])
    expect(sideSpy.calls).deep.eq([
      [null], [undefined],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
