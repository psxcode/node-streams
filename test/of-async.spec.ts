import { expect } from 'chai'
import { describe, it } from 'mocha'
import { writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import ofAsync from '../src/of-async'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import interval from './interval'

const writableLog = debug('ns:writable')

describe('[ ofAsync ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = createSpy(() => {})
    const r = ofAsync({ objectMode: true })(interval(30))(...data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
