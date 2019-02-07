import { waitTimePromise } from '@psxcode/wait'
import { onceAllPromise } from 'node-on'

const streamFinished = async (...emitters: NodeJS.EventEmitter[]) => {
  await onceAllPromise('end', 'finish', 'close')(...emitters)
  await waitTimePromise(10)
}

export default streamFinished
