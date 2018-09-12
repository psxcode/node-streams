import EventEmitter = NodeJS.EventEmitter
import toEmitterValue from './to-emitter-value'
import { EmitterValue } from './types'

const onceRaceEx = (...events: string[]) =>
  (cb: (value: EmitterValue) => void) =>
    (...emitters: EventEmitter[]) => {
      const cbs = new WeakMap<EventEmitter, any>(
        emitters.map((emitter, i) => [
          emitter,
          () => {
            unsubscribe()
            toEmitterValue({ value: undefined, emitter, emitterIndex: i })(cb)
          }
        ] as [EventEmitter, any])
      )

      function unsubscribe () {
        emitters.forEach(ee => events.forEach(e => ee.removeListener(e, cbs.get(ee))))
      }

      /* subscribe */
      emitters.forEach(ee => events.forEach(e => ee.addListener(e, cbs.get(ee))))
      return unsubscribe
    }

export default onceRaceEx
