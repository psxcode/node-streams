import { Transform, TransformOptions } from 'stream'
import { WaitFn } from './types'

const debounce = (opts: TransformOptions) =>
  (wait: WaitFn) => {
    let lastChunk: any
    let unsubscribe: any
    return new Transform({
      ...opts,
      transform (chunk, encoding, callback) {
        lastChunk = chunk
        unsubscribe && unsubscribe()
        unsubscribe = wait(() => {
          unsubscribe = undefined
          this.push(lastChunk)
          lastChunk = undefined
        })
        callback()
      },
      flush (callback) {
        unsubscribe && unsubscribe()
        callback(undefined, lastChunk)
      }
    })
  }

export default debounce
