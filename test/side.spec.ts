import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import side from '../src/side'
import makeNumbers from './make-numbers'
import makeStrings from './make-strings'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

const multiply = (multiplier: number) => (value: number) => value * multiplier

describe('[ side ]', () => {
  it('shoudl work', async () => {
    const data = makeStrings(3)
    const spy = createSpy(() => {})
    const sideSpy = createSpy(() => {})
    const r = readable({ eager: true, log: readableLog })({ encoding: 'utf8' })(data)
    const t = side({ objectMode: true })(sideSpy)
    const w = writable({ log: writableLog })({ decodeStrings: false })(spy)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([
      [0], [1], [2],
    ])
    expect(getSpyCalls(sideSpy)).deep.eq([
      [0], [1], [2],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
