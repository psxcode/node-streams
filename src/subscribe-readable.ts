/* tslint:disable no-conditional-assignment */
import { on, onceAll, onEx } from 'node-on'
import ReadableStream = NodeJS.ReadableStream
import noop from './noop'
import { IObserver } from './types'

const subscribeReadable = ({ next, error, complete = noop }: IObserver) =>
  (...streams: ReadableStream[]) => {
    const onComplete = () => {
      unsubscribe()
      complete()
    }
    const unsub = [
      onEx('readable')(({ emitter }) => {
        let chunk
        while (chunk = (emitter as ReadableStream).read()) {
          next(chunk)
        }
      })(...streams),
      error ? on('error')(error)(...streams) : noop,
      onceAll('end')(onComplete)(...streams)
    ]
    return unsubscribe

    function unsubscribe () {
      for (let u of unsub) u()
    }
  }

export default subscribeReadable
