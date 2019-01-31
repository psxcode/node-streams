import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import side from '../src/side'
import makeNumbers from './make-numbers'
import makeStrings from './make-strings'
import finished from './stream-finished'

const readableLog = debug('node-streams:readable')
const writableLog = debug('node-streams:writable')

const multiply = (multiplier: number) => (value: number) => value * multiplier

describe('[ side ]', () => {
  it('shoudl work', async () => {
    const data = makeStrings(8)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, log: readableLog })({ encoding: 'utf8' })(data)
    const t = side({ objectMode: true })((x) => x)
    const w = writable({ log: writableLog })({ decodeStrings: false })(spy)
    const p = pipeline(r, t, w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })

  it('shoudl work', async () => {
    const data = makeNumbers(4)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, log: readableLog })({ encoding: 'utf8' })(data)
    const t = side({ objectMode: true })(multiply(2))
    const w = writable({ log: writableLog })({ decodeStrings: false })(spy)
    const p = pipeline(r, t, w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
