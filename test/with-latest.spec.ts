import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import withLatest from '../src/with-latest'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

let i = 0
const readableLog = () => debug(`node-streams:readable:${i++}`)
const writableLog = debug('node-streams:writable')

describe('[ withLatest ]', () => {
  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = createSpy(() => {})
    const s1 = readable({ eager: true, delayMs: 5, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: true, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const s3 = readable({ eager: true, delayMs: 50, log: readableLog() })({ objectMode: true })(data)
    const r = withLatest({ objectMode: true })(s2, s3)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = pipeline(r, w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
