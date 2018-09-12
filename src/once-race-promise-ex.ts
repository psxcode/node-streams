import onceRaceEx from './once-race-ex'
import EventEmitter = NodeJS.EventEmitter

const onceRacePromiseEx = (...events: string[]) =>
  (...emitters: EventEmitter[]) =>
    new Promise(resolve => {
      onceRaceEx(...events)(resolve)(...emitters)
    })

export default onceRacePromiseEx
