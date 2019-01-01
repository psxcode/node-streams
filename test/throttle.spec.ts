import { makeNumbers, readable, transformTest, writable } from 'node-stream-test'
import debug from 'debug'
import throttle from '../src/throttle'

const log = debug('producer')

const interval = (next: () => void) => {
  console.log('subscribe')
  const id = setTimeout(next, 30)

  return () => {
    console.log('clear')
    clearTimeout(id)
  }
}

describe('[throttle]', () => {
  transformTest<number>(
    makeNumbers(8),
    readable({ delayMs: 0, log })({ objectMode: true }),
    writable({})({ objectMode: true }),
    () => throttle({ objectMode: true })(interval)
  )
})
