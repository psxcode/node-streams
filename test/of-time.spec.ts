import { expect } from 'chai'
import { describe, it } from 'mocha'
import { writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import ofTime from '../src/of-time'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

const writableLog = debug('ns:writable')

describe('[ ofTime ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = createSpy(() => {})
    const r = ofTime({ objectMode: true })(30)(...data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
