import { on, onceAll, onEx } from 'node-on'
import noop from './noop'
import { IAsyncObserver } from './types'

const subscribeAsync = ({ next, error, complete = noop }: IAsyncObserver) =>
  (...streams: NodeJS.ReadableStream[]) => {
    const readables: (NodeJS.ReadableStream | undefined)[] = streams.map(() => undefined)
    let readableIndex = 0
    let promise: Promise<void> | undefined = undefined
    let done = false
    const findNextReadable = () => {
      if (readables[readableIndex]) {
        return readables[readableIndex]
      }
      for (let i = 0 ; i < readables.length; ++i) {
        readableIndex = (readableIndex + 1) % readables.length
        if (readables[readableIndex]) {
          return readables[readableIndex]
        }
      }

      return null
    }
    const consume = async () => {
      if (done || promise) return

      const readable = findNextReadable()
      if (readable) {
        let chunk
        while (!done && (chunk = readable.read()) !== null) {
          await (promise = next(chunk))
        }
        promise = undefined
        readables[readableIndex] = undefined

        setImmediate(consume)
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
