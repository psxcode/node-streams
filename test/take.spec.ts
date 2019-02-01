import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import take from '../src/take'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

describe('[ take ]', () => {
  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const t = take({ objectMode: true })(5)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
