import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import combine from '../src/combine'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

let i = 0
const readableLog = () => debug(`ns-readable${i++}`)
const writableLog = debug('ns-writable')

describe('[ combine ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = createSpy(() => {})
    const s1 = readable({ eager: true, delayMs: 12, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: true, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const s3 = readable({ eager: true, delayMs: 8, log: readableLog() })({ objectMode: true })(data)
    const r = combine({ objectMode: true })(s1, s2, s3)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = pipeline(r, w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
