import { Readable, ReadableOptions } from 'stream'
import empty from './empty'
import subscribeEx from './subscribe-ex'
import { UnsubFn } from './types'

const combine = (opts: ReadableOptions) => (...streams: NodeJS.ReadableStream[]): NodeJS.ReadableStream => {
  let unsubscribe: UnsubFn
  const latest = streams.map(() => undefined)

  return streams.length
    ? new Readable({
      ...opts,
      read () {
        if (!unsubscribe) {
          unsubscribe = subscribeEx({
            next: ({ value, emitterIndex }) => {
              latest[emitterIndex] = value
              this.push(latest.slice())
            },
            error: ({ value }) => this.emit('error', value),
            complete: () => {
              this.push(null)
              this.destroy()
            },
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

export default combine
