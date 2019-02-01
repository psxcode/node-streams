import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import filter from '../src/filter'
import first from '../src/first'
import map from '../src/map'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

const isEqual = (value: number) => (arg: number) => value === arg
const multiply = (multiplier: number) => (value: number) => value * multiplier

describe('[ first ]', () => {
  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const pipe = pipeline(
      r,
      first({ objectMode: true }),
      w
    )

    await finished(pipe)

    expect(getSpyCalls(spy)).deep.eq([])
  })

  it('should work', async () => {
    const data = makeNumbers(8)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, log: readableLog })({ objectMode: true })(data)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = pipeline(
      r,
      filter({ objectMode: true })(isEqual(10)),
      first({ objectMode: true }),
      map({ objectMode: true })(multiply(2)),
      w
    )

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
