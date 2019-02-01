import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readable, writable } from 'node-stream-test'
import debug from 'debug'
import { createSpy, getSpyCalls } from 'spyfn'
import map from '../src/map'
import makeNumbers from './make-numbers'
import makeStrings from './make-strings'
import finished from './stream-finished'

const readableLog = debug('ns:readable')
const writableLog = debug('ns:writable')

const multiply = (multiplier: number) => (value: number) => value * multiplier
const identity = <T> (x: T) => x

describe('[ map ]', () => {
  it('should work', async () => {
    const data = makeStrings(6)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, log: readableLog })({ encoding: 'utf8' })(data)
    const w = writable({ log: writableLog })({ decodeStrings: false })(spy)
    const t = map({ objectMode: true })(identity)
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })

  it('should work', async () => {
    const data = makeNumbers(6)
    const spy = createSpy(() => {})
    const r = readable({ eager: true, log: readableLog })({ encoding: 'utf8' })(data)
    const w = writable({ log: writableLog })({ decodeStrings: false })(spy)
    const t = map({ objectMode: true })(multiply(2))
    const p = r.pipe(t).pipe(w)

    await finished(p)

    expect(getSpyCalls(spy)).deep.eq([])
  })
})
