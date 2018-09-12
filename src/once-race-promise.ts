import onceRace from './once-race'
import EventEmitter = NodeJS.EventEmitter

const onceRacePromise = (...events: string[]) =>
  (...emitters: EventEmitter[]) =>
    new Promise(resolve => {
      onceRace(...events)(resolve)(...emitters)
    })

export default onceRacePromise
