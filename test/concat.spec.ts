import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import concat from '../src/concat'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

let i = 0
const readableLog = () => debug(`ns:readable:${i++}`)
const consumerLog = debug('ns:consumer')

describe('[ concat ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = createSpy(() => {})
    const s1 = readable({ eager: true, delayMs: 50, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: true, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const r = concat({ objectMode: true })(s1, s2)
    const w = writable({ log: consumerLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
