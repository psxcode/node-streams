import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import empty from '../src/empty'
import finished from './stream-finished'

const log = debug('ns-writable')

describe('[ empty ]', () => {
  it('should work', async () => {
    const spy = createSpy(() => {})
    const r = empty({ objectMode: true })
    const w = writable({ log })({ objectMode: true })(spy)
    const p = pipeline(r, w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
