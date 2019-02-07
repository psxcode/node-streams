import { expect } from 'chai'
import { describe, it } from 'mocha'
import { writable } from 'node-stream-test'
import debug from 'debug'
import fn from 'test-fn'
import empty from '../src/empty'
import finished from './stream-finished'
import numEvents from './num-events'

const log = debug('ns:writable')

describe('[ empty ]', () => {
  it('should work', async () => {
    const spy = fn()
    const r = empty({ objectMode: true })
    const w = writable({ log })({ objectMode: true })(spy)
    r.pipe(w)

    await finished(r, w)

    expect(spy.calls).deep.eq([])
    expect(numEvents(r, w)).eq(0)
  })
})
