import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import startWith from '../src/start-with'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

let i = 0
const readableLog = () => debug(`node-streams:readable:${i++}`)
const writableLog = debug('node-streams:writable')

describe('[ concat ]', () => {
  it('should work', async () => {
    const data = [5, 6, 7, 8, 9]
    const spy = createSpy(() => {})
    const s1 = readable({ eager: true, delayMs: 50, log: readableLog() })({ objectMode: true })(data)
    const r = startWith({ objectMode: true })(0, 1, 2, 3, 4)(s1)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = pipeline(r, w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
