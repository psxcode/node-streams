import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import withLatest from '../src/with-latest'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

let i = 0
const readableLog = () => debug(`ns:readable:${i++}`)
const writableLog = debug('ns:writable')

describe('[ withLatest ]', () => {
  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = createSpy(() => {})
    const s1 = readable({ eager: true, delayMs: 5, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: true, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const s3 = readable({ eager: true, delayMs: 50, log: readableLog() })({ objectMode: true })(data)
    const r = withLatest({ objectMode: true })(s2, s3)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
    expect(numEvents(r)).eq(0)
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(s3)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
