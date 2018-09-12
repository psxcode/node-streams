/* tslint:disable no-conditional-assignment */
import noop from './noop'
import onEx from './on-ex'
import on from './on'
import onceAll from './once-all'
import { IObserver } from './types'
import ReadableStream = NodeJS.ReadableStream

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
