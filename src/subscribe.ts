import noop from './noop'
import on from './on'
import onceAll from './once-all'
import { IObserver } from './types'
import ReadableStream = NodeJS.ReadableStream

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
