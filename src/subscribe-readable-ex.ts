/* tslint:disable no-conditional-assignment */
import noop from './noop'
import onEx from './on-ex'
import onceAll from './once-all'
import on from './on'
import { IObserverEx } from './types'
import ReadableStream = NodeJS.ReadableStream

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
