import EventEmitter = NodeJS.EventEmitter

const onceAll = (...events: string[]) =>
  (cb: (values: any[]) => void) =>
    (...emitters: EventEmitter[]) => {
      const doneEE = new WeakMap<EventEmitter, number>()
      const cbs = new WeakMap<EventEmitter, any>()
      const values = new Array(emitters.length)
      emitters.forEach(ee => doneEE.set(ee, 0))
      emitters.forEach((ee, i) => cbs.set(ee, listener.bind(null, ee, i)))

      /* subscribe */
      emitters.forEach(ee => events.forEach(e => ee.once(e, cbs.get(ee))))
      return unsubscribe

      function listener (ee: EventEmitter, index: number, value: any) {
        doneEE.set(ee, (doneEE.get(ee) as number) + 1)
        values[index] = value
        if (emitters.every(ee => (doneEE.get(ee) as number) === events.length)) {
          unsubscribe()
          return cb(values)
        }
      }

      function unsubscribe () {
        emitters.forEach(ee => events.forEach(e => ee.removeListener(e, cbs.get(ee))))
      }
    }

export default onceAll
