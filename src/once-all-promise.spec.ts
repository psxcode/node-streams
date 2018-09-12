import { EventEmitter } from 'events'
import * as sinon from 'sinon'
import { waitTimePromise as wait } from '@psxcode/wait'
import onceAllPromise from './once-all-promise'

describe('[ onceAllPromise ]', () => {
  it('should resolve when all of events fires', async () => {
    const ee = new EventEmitter()
    const spy = sinon.spy()
    onceAllPromise('event1', 'event2', 'event3')(ee).then(spy)

    await wait(150)
    sinon.assert.notCalled(spy)

    ee.emit('event0')
    await wait(10)
    sinon.assert.notCalled(spy)

    ee.emit('event1')
    await wait(10)
    sinon.assert.notCalled(spy)

    ee.emit('event2')
    await wait(10)
    sinon.assert.notCalled(spy)

    ee.emit('event3')
    await wait(10)
    sinon.assert.calledOnce(spy)
  })
})
