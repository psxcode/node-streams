import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import of from '../src/of'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

const writableLog = debug('ns-writable')

describe('[ of ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = createSpy(() => {})
    const r = of({ objectMode: true })(...data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = pipeline(r, w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
