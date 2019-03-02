import { on, onceAll, onEx } from 'node-on'
import noop from './noop'
import { IAsyncObserver } from './types'

const subscribeAsync = ({ next, error, complete = noop }: IAsyncObserver) =>
  (...streams: NodeJS.ReadableStream[]) => {
    let promise = Promise.resolve()
    let consumerRejected = false
    let inProgress = false
    const readables: (NodeJS.ReadableStream | undefined)[] = streams.map(() => undefined)
    let readableIndex = 0
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
    const onReadable = async () => {
      if (inProgress || consumerRejected) {
        return
      }

      const readable = findNextReadable()
      if (readable) {
        inProgress = true

        let chunk: any
        while (!consumerRejected && (chunk = readable.read()) !== null) {
          await (promise = promise.then(() => next(chunk)).catch(unsubscribe))
        }
        readables[readableIndex] = undefined

        inProgress = false
        setImmediate(onReadable)
      }
    }
    const onError = (e: any) => {
      promise = promise.then(() => error!(e)).catch(unsubscribe)
    }
    const onComplete = () => {
      promise = promise.then(() => (unsubscribe(), complete()))
    }
    const unsub = [
      onEx('readable')(({ emitter, emitterIndex }) => {
        readables[emitterIndex] = emitter as NodeJS.ReadableStream
        onReadable()
      })(...streams),
      on('error')(error ? onError : noop)(...streams),
      onceAll('end')(onComplete)(...streams),
    ]

    return unsubscribe

    function unsubscribe () {
      consumerRejected = true
      for (const u of unsub) u()
    }
  }

export default subscribeAsync
