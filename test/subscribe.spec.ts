import { expect } from 'chai'
import { describe, it } from 'mocha'
import { createSpy, getSpyCalls } from 'spyfn'
import { readable } from 'node-stream-test'
import { waitTimePromise as wait } from '@psxcode/wait'
import debug from 'debug'
import subscribe from '../src/subscribe'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

let i = 0
const readableLog = () => debug(`ns:readable:${i++}`)

describe('[ subscribe ]', () => {
  it('should work with single stream', async () => {
    const d1 = makeNumbers(8)
    const spy = createSpy(() => {})
    const s1 = readable({ eager: true, log: readableLog() })({ objectMode: true })(d1)
    subscribe({ next: spy })(s1)

    await finished(s1)

    expect(getSpyCalls(spy)).deep.eq([])
  })

  it('should work with multiple streams', async () => {
    const d1 = [0, 1, 2, 3, 4]
    const d2 = makeNumbers(5)
    const spy = createSpy(() => {})
    const s1 = readable({ eager: true, delayMs: 10, log: readableLog() })({ objectMode: true })(d1)
    const s2 = readable({ eager: true, delayMs: 15, log: readableLog() })({ objectMode: true })(d2)
    subscribe({ next: spy })(s1, s2)

    await Promise.all([
      finished(s1),
      finished(s2),
    ])

    expect(getSpyCalls(spy)).deep.eq([])
  })

  it('should work with complete', async () => {
    const d1 = [0, 1, 2, 3, 4]
    const d2 = makeNumbers(5)
    const spy = createSpy(() => {})
    const completeSpy = createSpy(() => {})
    const s1 = readable({ eager: true, delayMs: 10, log: readableLog() })({ objectMode: true })(d1)
    const s2 = readable({ eager: true, delayMs: 15, log: readableLog() })({ objectMode: true })(d2)
    subscribe({ next: spy, complete: completeSpy })(s1, s2)

    await Promise.all([
      finished(s1),
      finished(s2),
    ])

    expect(getSpyCalls(spy)).deep.eq([])
    expect(getSpyCalls(completeSpy)).deep.eq([[]])
  })

  it('should work with unsubscribe', async () => {
    const d1 = makeNumbers(8)
    const spy = createSpy(() => {})
    const completeSpy = createSpy(() => {})
    const s1 = readable({ eager: true, delayMs: 10, log: readableLog() })({ objectMode: true })(d1)
    const unsub = subscribe({ next: spy, complete: completeSpy })(s1)

    unsub()

    await finished(s1)

    expect(getSpyCalls(spy)).deep.eq([])
    expect(getSpyCalls(completeSpy)).deep.eq([[]])
  })
})
