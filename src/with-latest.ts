import ReadableStream = NodeJS.ReadableStream
import { Readable, ReadableOptions } from 'stream'
import subscribe from './subscribe'
import subscribeEx from './subscribe-ex'
import empty from './empty'
import { EmitterValue } from './types'

const withLatest = (opts: ReadableOptions) =>
  (...streams: ReadableStream[]) => (main: ReadableStream): ReadableStream => {
    let unsubscribeMain: (() => void) | undefined
    let unsubscribeRest: (() => void) | undefined
    let latest = new Array(streams.length)
    const unsub = () => {
      unsubscribeMain && unsubscribeMain()
      unsubscribeRest && unsubscribeRest()
      unsubscribeMain = unsubscribeRest = undefined
    }
    return streams.length
      ? new Readable({
        ...opts,
        read () {
          if (!unsubscribeMain) {
            unsubscribeMain = subscribe({
              next: value => this.push([value, ...latest]),
              error: e => this.emit('error', e),
              complete: () => {
                this.push(null)
                unsub()
              }
            })(main)
            unsubscribeRest = subscribeEx({
              next: ({ value, emitterIndex }: EmitterValue) => latest[emitterIndex] = value
            })(...streams)
          }
        },
        destroy: unsub
      })
      : empty(opts)()
  }

export default withLatest
