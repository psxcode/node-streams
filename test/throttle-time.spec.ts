import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import throttleTime from '../src/throttle-time'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

describe('[ throttleTime ]', () => {
  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, delayMs: 0, log: readableLog })({ objectMode: true })(data)
    const t = throttleTime({ objectMode: true })(30)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
