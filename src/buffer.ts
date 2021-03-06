import { Transform, TransformOptions } from 'stream'
import { UnsubFn, WaitFn } from './types'

const buffer = (opts: TransformOptions) =>
  (wait: WaitFn) => {
    let buf: any[] = []
    let unsubscribe: UnsubFn

    return new Transform({
      ...opts,
      transform (chunk, encoding, callback) {
        buf.push(chunk)
        if (!unsubscribe) {
          unsubscribe = wait(() => {
            unsubscribe = undefined
            this.push(buf)
            buf = []
          })
        }
        callback()
      },
      flush (callback) {
        unsubscribe && unsubscribe()
        if (buf.length > 0) {
          this.push(buf)
        }
        callback()
      },
    })
  }

export default buffer
