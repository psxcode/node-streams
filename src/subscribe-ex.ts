import { onceAll, onEx } from 'node-on'
import noop from './noop'
import { IObserverEx } from './types'

const subscribeEx = ({ next, error, complete = noop }: IObserverEx) =>
  (...streams: NodeJS.ReadableStream[]) => {
    const onComplete = () => {
      unsubscribe()
      complete()
    }
    const unsub = [
      onEx('data')(next)(...streams),
      error ? onEx('error')(error)(...streams) : noop,
      onceAll('end')(onComplete)(...streams),
    ]

    return unsubscribe

    function unsubscribe () {
      for (const u of unsub) u()
    }
  }

export default subscribeEx
