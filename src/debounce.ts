import { Transform, TransformOptions } from 'stream'
import { WaitFn } from './types'

const debounce = (opts: TransformOptions) =>
  (wait: WaitFn) => {
    let lastChunk: any
    let unsubscribe: any

    return new Transform({
      ...opts,
      transform (chunk, encoding, callback) {
        lastChunk = chunk !== null ? chunk : undefined
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
        this.push(lastChunk)
        callback()
      },
    })
  }

export default debounce
