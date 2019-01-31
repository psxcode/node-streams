import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import zip from '../src/zip'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

let i = 0
const readableLog = () => debug(`node-streams:readable:${i++}`)
const writableLog = debug('node-streams:writable')

describe('[ zip ]', () => {
  it('should work', async () => {
    const d1 = makeNumbers(5)
    const d2 = [0, 1, 2, 3, 4, 5, 6]
    const spy = createSpy(() => {})
    const s1 = readable({ eager: true, delayMs: 30, log: readableLog() })({ objectMode: true })(d1)
    const s2 = readable({ eager: true, delayMs: 10, log: readableLog() })({ objectMode: true })(d2)
    const r = zip({ objectMode: true })(s1, s2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = pipeline(r, w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
