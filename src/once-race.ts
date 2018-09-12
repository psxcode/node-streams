import EventEmitter = NodeJS.EventEmitter

const onceRace = (...events: string[]) =>
  (cb: (value: any) => void) =>
    (...emitters: EventEmitter[]) => {
      const onData = (value: any) => {
        unsubscribe()
        cb(value)
      }

      function unsubscribe () {
        emitters.forEach(ee => events.forEach(e => ee.removeListener(e, onData)))
      }

      /* subscribe */
      emitters.forEach(ee => events.forEach(e => ee.addListener(e, onData)))
      return unsubscribe
    }

export default onceRace
