import { Readable, ReadableOptions } from 'stream'
import { UnsubFn, WaitFn } from './types'

const ofAsync = (opts: ReadableOptions) =>
  (wait: WaitFn) => <T> (...values: T[]) => {
    let i = 0
    let unsubscribe: UnsubFn

    return new Readable({
      ...opts,
      read () {
        if (!unsubscribe) {
          unsubscribe = wait(() => {
            unsubscribe = undefined
            let val

            return i < values.length
              ? this.push((val = values[i++]) !== null ? val : undefined)
              : this.push(null)
          })
        }
      },
      destroy () {
        unsubscribe && unsubscribe()
      },
    })
  }

export default ofAsync
