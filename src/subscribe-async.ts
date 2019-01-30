import { on, onceAll, onEx } from 'node-on'
import noop from './noop'
import { IAsyncObserver } from './types'

const subscribeAsync = ({ next, error, complete = noop }: IAsyncObserver) =>
  (...streams: NodeJS.ReadableStream[]) => {
    const readables: (NodeJS.ReadableStream | undefined)[] = streams.map(() => undefined)
    let readableIndex = 0
    let promise: Promise<void> | undefined = undefined
    let done = false
    const consume = async () => {
      if (promise) return

      for (let i = 0; i < readables.length; ++i) {
        readableIndex = (readableIndex + 1) % readables.length
        const readable = readables[readableIndex]
        if (readable) {
          let chunk
          while (!done && (chunk = readable.read())) {
            await (promise = next(chunk))
          }
          promise = undefined
          readables[readableIndex] = undefined
        }
      }
    }
    const onComplete = () => {
      unsubscribe()
      complete()
    }
    const unsub = [
      onEx('readable')(({ emitter, emitterIndex }) => {
        readables[emitterIndex] = emitter as NodeJS.ReadableStream
        consume()
      })(...streams),
      error ? on('error')(error)(...streams) : noop,
      onceAll('end')(onComplete)(...streams),
    ]

    return unsubscribe

    function unsubscribe () {
      done = true
      for (const u of unsub) u()
    }
  }

export default subscribeAsync
