import { expect } from 'chai'
import { describe, it } from 'mocha'
import fn from 'test-fn'
import { readable } from 'node-stream-test'
import debug from 'debug'
import subscribe from '../src/subscribe'
import makeNumbers from './make-numbers'
import finished from './stream-finished'
import numEvents from './num-events'

let i = 0
const readableLog = () => debug(`ns:readable:${i++}`)

describe('[ subscribe ]', () => {
  it('should work with single stream', async () => {
    const d1 = makeNumbers(4)
    const spy = fn()
    const s1 = readable({ eager: true, log: readableLog() })({ objectMode: true })(d1)
    subscribe({ next: spy })(s1)

    await finished(s1)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [3],
    ])
    expect(numEvents(s1)).eq(0)
  })

  it('should work with multiple streams', async () => {
    const d1 = [0, 1, 2, 3]
    const d2 = makeNumbers(4)
    const spy = fn()
    const s1 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(d1)
    const s2 = readable({ eager: false, delayMs: 10, log: readableLog() })({ objectMode: true })(d2)
    subscribe({ next: spy })(s1, s2)

    await finished(s1, s2)

    expect(spy.calls).deep.eq([
      [0], [0], [1], [1], [2], [2], [3], [3],
    ])
    expect(numEvents(s1, s2)).eq(0)
  })

  it('should work with complete', async () => {
    const d1 = [0, 1, 2, 3]
    const d2 = makeNumbers(4)
    const spy = fn()
    const completeSpy = fn()
    const s1 = readable({ eager: true, delayMs: 0, log: readableLog() })({ objectMode: true })(d1)
    const s2 = readable({ eager: true, delayMs: 0, log: readableLog() })({ objectMode: true })(d2)
    subscribe({ next: spy, complete: completeSpy })(s1, s2)

    await finished(s1, s2)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [3], [0], [1], [2], [3],
    ])
    expect(completeSpy.calls).deep.eq([
      [],
    ])
    expect(numEvents(s1, s2)).eq(0)
  })

  it('should work with unsubscribe', async () => {
    const d1 = makeNumbers(4)
    const spy = fn()
    const completeSpy = fn()
    const s1 = readable({ eager: true, delayMs: 10, log: readableLog() })({ objectMode: true })(d1)
    const unsub = subscribe({ next: spy, complete: completeSpy })(s1)

    unsub()

    await finished(s1)

    expect(spy.calls).deep.eq([])
    expect(completeSpy.calls).deep.eq([])
    expect(numEvents(s1)).eq(0)
  })

  it('error handling - error break', async () => {
    const d1 = makeNumbers(4)
    const spy = fn(debug('ns:sink'))
    const errorSpy = fn(debug('ns:error'))
    const completeSpy = fn(debug('ns:complete') as any)
    const s1 = readable({ eager: true, delayMs: 10, log: readableLog(), errorAtStep: 1, continueOnError: false })({ objectMode: true })(d1)
    subscribe({ next: spy, error: errorSpy, complete: completeSpy })(s1)

    await finished(s1)

    expect(spy.calls).deep.eq([
      [0],
    ])
    expect(errorSpy.errors).deep.eq([
      ['error at 1'],
    ])
    expect(completeSpy.calls).deep.eq([
      [],
    ])
    expect(numEvents(s1)).eq(0)
  })

  it('error handling - error continue', async () => {
    const d1 = makeNumbers(4)
    const spy = fn(debug('ns:sink'))
    const errorSpy = fn(debug('ns:error'))
    const completeSpy = fn(debug('ns:complete') as any)
    const s1 = readable({ eager: true, delayMs: 10, log: readableLog(), errorAtStep: 1, continueOnError: true })({ objectMode: true })(d1)
    subscribe({ next: spy, error: errorSpy, complete: completeSpy })(s1)

    await finished(s1)

    expect(spy.calls).deep.eq([
      [0], [1], [2], [3],
    ])
    expect(errorSpy.errors).deep.eq([
      ['error at 1'],
    ])
    expect(completeSpy.calls).deep.eq([
      [],
    ])
    expect(numEvents(s1)).eq(0)
  })
})
