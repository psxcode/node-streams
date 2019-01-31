import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import combine from '../src/combine'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

let i = 0
const readableLog = () => debug(`node-streams:readable:${i++}`)
const writableLog = debug('node-streams:writable')

describe('[ combine ]', () => {
  it('lazy readables', async () => {
    const data = makeNumbers(3)
    const spy = createSpy(() => {})
    const s1 = readable({ eager: false, delayMs: 12, log: readableLog() })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(data)
    const s3 = readable({ eager: false, delayMs: 8, log: readableLog() })({ objectMode: true })(data)
    const r = combine({ objectMode: true })(s1, s2, s3)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([
      [[undefined, undefined, 0]],
      [[undefined, 0, 0]],
      [[0, 0, 0]],
      [[0, 0, 1]],
      [[0, 1, 1]],
      [[1, 1, 1]],
      [[1, 1, 2]],
      [[1, 2, 2]],
      [[2, 2, 2]],
    ])
  })

  it.only('readable emits error', async () => {
    const data = makeNumbers(2)
    const spy = createSpy(() => {})
    const s1 = readable({ eager: false, delayMs: 0, log: readableLog(), errorAtStep: 1 })({ objectMode: true })(data)
    const s2 = readable({ eager: false, delayMs: 0, log: readableLog() })({ objectMode: true })(data)
    const r = combine({ objectMode: true })(s1, s2)
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    // r.on('error', () => {})

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([
      [[0, undefined]],
      [[0, 0]],
      [[0, 1]],
    ])
  })

  it('no readables', async () => {
    const spy = createSpy(() => {})
    const r = combine({ objectMode: true })()
    const w = writable({ log: writableLog })({ objectMode: true })(spy)
    const p = r.pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
