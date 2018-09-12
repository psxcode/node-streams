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
            this.push(i < values.length ? values[i++] : null)
          })
        }
      },
      destroy () {
        unsubscribe && unsubscribe()
      }
    })
  }

export default ofAsync
