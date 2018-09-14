/* tslint:disable no-conditional-assignment */
import { onceAll, onEx } from 'node-on'
import ReadableStream = NodeJS.ReadableStream
import noop from './noop'
import { IObserverEx } from './types'

const subscribeEx = ({ next, error, complete = noop }: IObserverEx) =>
  (...streams: ReadableStream[]) => {
    const onComplete = () => {
      unsubscribe()
      complete()
    }
    const unsub = [
      onEx('data')(next)(...streams),
      error ? onEx('error')(error)(...streams) : noop,
      onceAll('end')(onComplete)(...streams)
    ]
    return unsubscribe

    function unsubscribe () {
      for (let u of unsub) u()
    }
  }

export default subscribeEx
