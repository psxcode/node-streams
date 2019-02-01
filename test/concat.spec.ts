import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import concat from '../src/concat'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

let i = 0
const readableLog = () => debug(`ns:readable:${i++}`)
const consumerLog = debug('ns:consumer')

describe('[ concat ]', () => {
  it('should work', async () => {
    const data = makeNumbers(3)
    const spy = createSpy(() => {})
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: true, log: readableLog() })({ objectMode: true })(data)
    const r = concat({ objectMode: true })(s1, s2)
    const w = writable({ log: consumerLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([
      [0],
      [1],
      [2],
      [0],
      [1],
      [2],
    ])
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(r)).eq(0)
    expect(numEvents(w)).eq(0)
  })

  it('readable emits error', async () => {
    const data = makeNumbers(3)
    const spy = createSpy(() => {})
    const s1 = readable({ eager: false, delayMs: 20, log: readableLog(), errorAtStep: 1 })({ objectMode: true })(data)
    const s2 = readable({ eager: true, log: readableLog() })({ objectMode: true })(data)
    const r = concat({ objectMode: true })(s1, s2)
    const w = writable({ log: consumerLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    r.on('error', () => {})

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([
      [0],
      [0],
      [1],
      [2],
    ])
    expect(numEvents(s1)).eq(0)
    expect(numEvents(s2)).eq(0)
    expect(numEvents(r)).eq(1)
    expect(numEvents(w)).eq(0)
  })

  it('no readables', async () => {
    const spy = createSpy(() => {})
    const r = concat({ objectMode: true })()
    const w = writable({ log: consumerLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
    expect(numEvents(r)).eq(0)
    expect(numEvents(w)).eq(0)
  })
})
