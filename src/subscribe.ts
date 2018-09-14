import { on, onceAll } from 'node-on'
import ReadableStream = NodeJS.ReadableStream
import noop from './noop'
import { IObserver } from './types'

const subscribe = ({ next, error, complete = noop }: IObserver) =>
  (...streams: ReadableStream[]) => {
    const onComplete = () => {
      unsubscribe()
      complete()
    }
    const unsub = [
      on('data')(next)(...streams),
      error ? on('error')(error)(...streams) : noop,
      onceAll('end')(onComplete)(...streams)
    ]
    return unsubscribe

    function unsubscribe () {
      for (let u of unsub) u()
    }
  }

export default subscribe
