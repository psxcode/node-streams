import ReadableStream = NodeJS.ReadableStream
import { Readable, ReadableOptions } from 'stream'
import empty from './empty'
import subscribeEx from './subscribe-ex'
import { EmitterValue, UnsubFn } from './types'

const combine = (opts: ReadableOptions) => (...streams: ReadableStream[]): ReadableStream => {
  let unsubscribe: UnsubFn
  let latest = new Array(streams.length)
  return streams.length
    ? new Readable({
      ...opts,
      read () {
        if (!unsubscribe) {
          unsubscribe = subscribeEx({
            next: ({ value, emitterIndex }: EmitterValue) => {
              latest[emitterIndex] = value
              this.push(latest.slice())
            },
            error: ({ value }: EmitterValue) => this.emit('error', value),
            complete: () => this.push(null)
          })(...streams)
        }
      },
      destroy () {
        unsubscribe && unsubscribe()
        unsubscribe = undefined
      }
    })
    : empty(opts)()
}

export default combine
