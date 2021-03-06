import { Readable, ReadableOptions } from 'stream'
import subscribe from './subscribe'
import subscribeEx from './subscribe-ex'

const withLatest = (opts: ReadableOptions) =>
  (...streams: NodeJS.ReadableStream[]) => (main: NodeJS.ReadableStream) => {
    let unsubscribeMain: (() => void) | undefined
    let unsubscribeRest: (() => void) | undefined
    const latest = new Array(streams.length)
    const unsub = () => {
      unsubscribeMain && unsubscribeMain()
      unsubscribeRest && unsubscribeRest()
      unsubscribeMain = undefined
      unsubscribeRest = undefined
    }

    return new Readable({
      ...opts,
      read () {
        if (!unsubscribeMain) {
          unsubscribeMain = subscribe({
            next: (value) => this.push([value, ...latest]),
            error: (e) => this.emit('error', e),
            complete: () => {
              this.push(null)
              unsub()
            },
          })(main)
          unsubscribeRest = subscribeEx({
            next: ({ value, emitterIndex }) => latest[emitterIndex] = value,
          })(...streams)
        }
      },
      destroy () {
        this.push(null)
        unsub()
      },
    })
  }

export default withLatest
