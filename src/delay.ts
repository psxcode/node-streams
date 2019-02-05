import { Transform, TransformOptions, PassThrough } from 'stream'
import { UnsubFn } from './types'

type DelayItem = {
  timestamp: number
  data: any
}

export const delayRaw = (timeout = setTimeout, cancel = clearTimeout, timestamp = Date.now) =>
  (opts: TransformOptions) => (ms: number) => {
    if (ms <= 0) {
      return new PassThrough(opts)
    }

    const buffer: DelayItem[] = []
    let inProgress = false
    let endCallback: UnsubFn

    function consume (this: Transform) {
      const item = buffer.shift()
      inProgress = !!item
      if (item) {
        const shouldGoIn = item.timestamp - timestamp() + ms
        if (shouldGoIn < 10) {
          this.push(item.data)
          consume.call(this)
        } else {
          timeout(() => {
            this.push(item.data)
            consume.call(this)
          }, shouldGoIn)
        }
      } else {
        endCallback && endCallback()
        endCallback = undefined
      }
    }

    return new Transform({
      ...opts,
      transform (chunk, encoding, callback) {
        buffer.push({
          timestamp: timestamp(),
          data: chunk,
        })
        if (!inProgress) {
          consume.call(this)
        }
        callback()
      },
      flush (callback) {
        endCallback = callback
        if (!inProgress) {
          endCallback()
        }
      },
    })
  }

export default delayRaw()
