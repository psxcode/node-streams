import EventEmitter = NodeJS.EventEmitter

const on = (...events: string[]) =>
  (cb: (value: any) => void) =>
    (...emitters: EventEmitter[]) => {
      /* subscribe */
      emitters.forEach(ee => events.forEach(e => ee.addListener(e, cb)))
      return () => {
        emitters.forEach(ee => events.forEach(e => ee.removeListener(e, cb)))
      }
    }

export default on
