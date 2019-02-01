import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import distinctUntilChanged from '../src/distinct-until-changed'
import finished from './stream-finished'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

describe('[ distinct ]', () => {
  it('should work', async () => {
    const data = [0, 1, 2, 2, 2, 3, 4, 4, 5, 5, 6, 7, 7, 8, 9, 9, 9]
    const spy = createSpy(() => {})
    const r = readable({ eager: true, delayMs: 30, log: readableLog })({ objectMode: true })(data)
    const t = distinctUntilChanged({ objectMode: true })
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = pipeline(r, t, w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
