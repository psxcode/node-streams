import { Readable, ReadableOptions } from 'stream'
import { onEx } from 'node-on'
import subscribeEx from './subscribe-ex'
import empty from './empty'
import { UnsubFn } from './types'

const zip = (opts: ReadableOptions) =>
  (...streams: NodeJS.ReadableStream[]): NodeJS.ReadableStream => {
    let unsubscribe: UnsubFn
    let unsubscribeEnd: UnsubFn
    const latest: any[][] = streams.map(() => [])
    const done: boolean[] = streams.map(() => false)
    const checkDone = () => done.some((d, i) => d && !latest[i].length)
    const hasValueForZip = () => latest.every((l) => l.length > 0)
    const unsub = () => {
      unsubscribe && unsubscribe()
      unsubscribeEnd && unsubscribeEnd()
      unsubscribe = undefined
      unsubscribeEnd = undefined
    }

    return streams.length
      ? new Readable({
        ...opts,
        read () {
          if (!unsubscribe) {
            unsubscribe = subscribeEx({
              next: ({ value, emitterIndex }) => {
                latest[emitterIndex].push(value)
                if (hasValueForZip()) {
                  this.push(latest.map((l) => l.shift()))
                  if (checkDone()) {
                    this.push(null)
                    unsub()
                  }
                }
              },
              error: ({ value }) => this.emit('error', value),
            })(...streams)
            unsubscribeEnd = onEx('end')(({ emitterIndex }) => {
              done[emitterIndex] = true
              if (checkDone()) {
                this.push(null)
                unsub()
              }
            })(...streams)
          }
        },
        destroy: unsub,
      })
      : empty(opts)
  }

export default zip
