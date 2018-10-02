/* tslint:disable no-conditional-assignment */
import ReadableStream = NodeJS.ReadableStream
import { on, onceAll, onEx } from 'node-on'
import noop from './noop'
import { IObserverEx } from './types'

const subscribeReadableEx = ({ next, error, complete = noop }: IObserverEx) =>
  (...streams: ReadableStream[]) => {
    const onComplete = () => {
      unsubscribe()
      complete()
    }
    const unsub = [
      onEx('readable')(({ emitter, emitterIndex }) => {
        let value
        while (value = (emitter as ReadableStream).read()) {
          next({ value, emitter, emitterIndex })
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

export default subscribeReadableEx