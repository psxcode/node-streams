import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import bufferTime from '../src/buffer-time'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

const readableLog = debug('ns-readable')
const writableLog = debug('ns-writable')

describe('[ bufferTime ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, delayMs: 5, log: readableLog })({ objectMode: true })(data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const t = bufferTime({ objectMode: true })(30)
    const p = pipeline(r, t, w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
