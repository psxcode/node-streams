import { Readable, ReadableOptions } from 'stream'
import { onEx } from 'node-on'
import subscribeEx from './subscribe-ex'
import empty from './empty'
import { UnsubFn } from './types'

const zip = (opts: ReadableOptions) =>
  (...streams: NodeJS.ReadableStream[]) => {
    let unsubscribe: UnsubFn
    let unsubscribeEnd: UnsubFn
    const dataFromStreams: any[][] = streams.map(() => [])
    const doneStreams: boolean[] = streams.map(() => false)
    const checkDone = () => doneStreams.some((done, i) => done && dataFromStreams[i].length === 0)
    const hasValueToZip = () => dataFromStreams.every((data) => data.length > 0)
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
                dataFromStreams[emitterIndex].push(value)
                if (hasValueToZip()) {
                  this.push(dataFromStreams.map((l) => l.shift()))
                  if (checkDone()) {
                    this.push(null)
                    unsub()
                  }
                }
              },
              error: ({ value }) => this.emit('error', value),
            })(...streams)
            unsubscribeEnd = onEx('end')(({ emitterIndex }) => {
              doneStreams[emitterIndex] = true
              if (checkDone()) {
                this.push(null)
                unsub()
              }
            })(...streams)
          }
        },
        destroy () {
          this.push(null)
          unsub()
        },
      })
      : empty(opts)
  }

export default zip
