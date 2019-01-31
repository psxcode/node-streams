import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import filter from '../src/filter'
import last from '../src/last'
import map from '../src/map'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

const readableLog = debug('node-streams:readable')
const writableLog = debug('node-streams:writable')

const isEqual = (value: number) => (arg: number) => value === arg
const multiply = (multiplier: number) => (value: number) => value * multiplier

describe('[ last ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = pipeline(
      r,
      filter({ objectMode: true })(isEqual(10)),
      last({ objectMode: true }),
      map({ objectMode: true })(multiply(2)),
      w
    )

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
