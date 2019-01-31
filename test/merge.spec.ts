import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import merge from '../src/merge'
import finished from './stream-finished'

let i = 0
const readableLog = () => debug(`node-streams:readable:${i++}`)
const writableLog = debug('node-streams:writable')

describe('[ merge ]', () => {
  it('should work', async () => {
    const data = [0, 1, 2, 3, 4]
    const spy = createSpy(() => {})
    const s1 = readable({ eager: true, delayMs: 50, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: true, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const r = merge({ objectMode: true })(s1, s2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = pipeline(r, w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
