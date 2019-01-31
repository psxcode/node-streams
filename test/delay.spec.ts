import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import debug from 'debug'
import { readable, writable } from 'node-stream-test'
import { createSpy, getSpyCalls } from 'spyfn'
import { delayRaw } from '../src/delay'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

const readableLog = debug('node-streams:readable')
const writableLog = debug('node-streams:writable')

describe('[ delay ]', () => {
  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, delayMs: 30, log: readableLog })({ objectMode: true })(data)
    const t = delayRaw()({ objectMode: true })(1000)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = pipeline(r, t, w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
