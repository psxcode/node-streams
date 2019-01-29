import { pipeline } from 'stream'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import buffer from '../src/buffer'
import makeNumbers from './make-numbers'
import finished from './stream-finished'

const readableLog = debug('ns-readable')
const consumerLog = debug('ns-consumer')
const intervalLog = debug('ns-interval')

const interval = (next: () => void) => {
  intervalLog('subscribe')
  const id = setTimeout(next, 30)

  return () => {
    intervalLog('clear')
    clearTimeout(id)
  }
}

describe('[ buffer ]', () => {
  it('should work', async () => {
    const data = makeNumbers(4)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, delayMs: 5, log: readableLog })({ objectMode: true })(data)
    const t = buffer({ objectMode: true })(interval)
    const w = writable({ log: consumerLog })({ objectMode: true })(spy)
    const pipe = pipeline(r, t, w)

    await finished(pipe)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
