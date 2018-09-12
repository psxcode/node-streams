import onceAll from './once-all'
import EventEmitter = NodeJS.EventEmitter

const onceAllPromise = (...events: string[]) => (...emitters: EventEmitter[]) =>
  new Promise(resolve => {
    onceAll(...events)(resolve)(...emitters)
  })

export default onceAllPromise
