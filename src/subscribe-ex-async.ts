import { onceAll, onEx } from 'node-on'
import noop from './noop'
import { IAsyncObserverEx } from './types'

const subscribeExAsync = ({ next, error, complete = noop }: IAsyncObserverEx) =>
  (...streams: NodeJS.ReadableStream[]) => {
    const readables: (NodeJS.ReadableStream | undefined)[] = streams.map(() => undefined)
    const readablesDataIndex = streams.map(() => 0)
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
          await (promise = next({
            value: chunk,
            index: readablesDataIndex[readableIndex]++,
            event: 'data',
            emitter: readable,
            emitterIndex: readableIndex,
          }))
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
      error ? onEx('error')(error)(...streams) : noop,
      onceAll('end')(onComplete)(...streams),
    ]

    return unsubscribe

    function unsubscribe () {
      done = true
      for (const u of unsub) u()
    }
  }

export default subscribeExAsync
