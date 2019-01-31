import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import filter from '../src/filter'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

const readableLog = debug('node-streams:readable')
const writableLog = debug('node-streams:writable')

const isEven = (value: number) => value % 2 === 0

describe('[ filter ]', () => {
  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const t = filter({ objectMode: true })(isEven)
    const p = pipeline(r, t, w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
