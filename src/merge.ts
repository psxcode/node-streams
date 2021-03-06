import { Readable, ReadableOptions } from 'stream'
import subscribe from './subscribe'
import { UnsubFn } from './types'
import empty from './empty'

const merge = (opts: ReadableOptions) => (...streams: NodeJS.ReadableStream[]): Readable => {
  let unsubscribe: UnsubFn

  return streams.length
    ? new Readable({
      ...opts,
      read () {
        if (!unsubscribe) {
          unsubscribe = subscribe({
            next: (value: any) => this.push(value),
            error: (e?: any) => this.emit('error', e),
            complete: () => this.push(null),
          })(...streams)
        }
      },
      destroy () {
        unsubscribe && unsubscribe()
        unsubscribe = undefined
      },
    })
    : empty(opts)
}

export default merge
