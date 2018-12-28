import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import buffer from './buffer'

const log = debug('producer')

const interval = (next: () => void) => {
  console.log('subscribe')
  const id = setTimeout(next, 30)
  return () => {
    console.log('clear')
    clearTimeout(id)
  }
}

describe('[ buffer ]', () => {
  transformTest(
    makeNumbers(4),
    readable({ delayMs: 5, log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => buffer({ objectMode: true })(interval))
})
