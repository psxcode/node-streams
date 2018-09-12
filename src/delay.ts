import { Transform, TransformOptions } from 'stream'
import { WaitPromiseFn } from './types'

type DelayItem = {
  timestamp: number
  data: any
}

const delay = (opts: TransformOptions) =>
 (wait: WaitPromiseFn, timestamp: () => number) =>
  (ms: number) => {
    const buffer: DelayItem[] = []
    let inProgress = false
    let endCallback: any
    function consume (this: Transform) {
      const item = buffer.shift()
      inProgress = !!item
      if (item) {
        const shouldGoIn = item.timestamp - timestamp() + ms
        if (shouldGoIn <= 10) {
          this.push(item.data)
          return consume.call(this)
        } else {
          wait(shouldGoIn).then(() => {
            this.push(item.data)
            return consume.call(this)
          })
        }
      } else {
        endCallback && endCallback()
      }
    }
    return new Transform({
      ...opts,
      transform (chunk, encoding, callback) {
        buffer.push({
          timestamp: timestamp(),
          data: chunk
        })
        if (!inProgress) {
          consume.call(this)
        }
        callback()
      },
      flush (callback) {
        endCallback = callback
      }
    })
  }

export default delay
