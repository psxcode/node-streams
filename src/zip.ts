import ReadableStream = NodeJS.ReadableStream
import { Readable, ReadableOptions } from 'stream'
import subscribeEx from './subscribe-ex'
import onEx from './on-ex'
import empty from './empty'
import { EmitterValue, UnsubFn } from './types'

const zip = (opts: ReadableOptions) =>
(...streams: ReadableStream[]): ReadableStream => {
  let unsubscribe: UnsubFn
  let unsubscribeEnd: UnsubFn
  let latest: any[][] = streams.map(() => [])
  let done: boolean[] = streams.map(() => false)
  const checkDone = () => done.some((d, i) => d && !latest[i].length)
  const hasValueForZip = () => latest.every(l => l.length > 0)
  const unsub = () => {
    unsubscribe && unsubscribe()
    unsubscribeEnd && unsubscribeEnd()
    unsubscribe = unsubscribeEnd = undefined
  }
  return streams.length
    ? new Readable({
      ...opts,
      read () {
        if (!unsubscribe) {
          unsubscribe = subscribeEx({
            next: ({ value, emitterIndex }: EmitterValue) => {
              latest[emitterIndex].push(value)
              if (hasValueForZip()) {
                this.push(latest.map(l => l.shift()))
                if (checkDone()) {
                  this.push(null)
                  unsub()
                }
              }
            },
            error: ({ value }: EmitterValue) => this.emit('error', value)
          })(...streams)
          unsubscribeEnd = onEx('end')(({ emitterIndex }: EmitterValue) => {
            done[emitterIndex] = true
            if (checkDone()) {
              this.push(null)
              unsub()
            }
          })(...streams)
        }
      },
      destroy: unsub
    })
    : empty(opts)()
}

export default zip
