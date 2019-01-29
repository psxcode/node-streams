import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import scan from '../src/scan'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

const readableLog = debug('ns-readable')
const writableLog = debug('ns-writable')

const addAll = (acc = 0, value: number) => acc + value

describe('[ scan ]', () => {
  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const t = scan({ objectMode: true })(addAll)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = pipeline(r, t, w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
