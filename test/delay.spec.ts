import { expect } from 'chai'
import { describe, it } from 'mocha'
import debug from 'debug'
import { readable, writable } from 'node-stream-test'
import { createSpy, getSpyCalls } from 'spyfn'
import { delayRaw } from '../src/delay'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

describe('[ delay ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = createSpy(() => {})
    const r = readable({ eager: false, delayMs: 30, log: readableLog })({ objectMode: true })(data)
    const t = delayRaw()({ objectMode: true })(200)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([
      [0],
      [1],
      [2],
      [3],
    ])
    expect(numEvents(r)).eq(0)
    expect(numEvents(t)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
