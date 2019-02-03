import { Transform, TransformOptions } from 'stream'
import { UnsubFn, WaitFn } from './types'

const throttle = (opts: TransformOptions) =>
  (wait: WaitFn) => {
    let lastChunk: any
    let unsubscribe: UnsubFn

    return new Transform({
      ...opts,
      transform (chunk, encoding, callback) {
        lastChunk = chunk !== null ? chunk : undefined
        if (!unsubscribe) {
          unsubscribe = wait(() => {
            unsubscribe = undefined
            this.push(lastChunk)
            lastChunk = undefined
          })
        }
        callback()
      },
      flush (callback) {
        unsubscribe && unsubscribe()
        this.push(lastChunk)
        callback()
      },
    })
  }

export default throttle
