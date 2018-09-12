import { EventEmitter } from 'events'
import * as sinon from 'sinon'
import { waitTimePromise as wait } from '@psxcode/wait'
import onceAll from './once-all'

describe('[ onceAll ]', () => {
  it('should work', async () => {
    const ee = new EventEmitter()
    const spy = sinon.spy()
    const unsub = onceAll('e1', 'e2')(spy)(ee)

    await wait(50)
    sinon.assert.notCalled(spy)

    await wait(50)
    ee.emit('e0')
    sinon.assert.notCalled(spy)

    await wait(50)
    ee.emit('e1')
    sinon.assert.notCalled(spy)

    await wait(50)
    ee.emit('e1')
    sinon.assert.notCalled(spy)

    await wait(50)
    ee.emit('e2')
    sinon.assert.calledOnce(spy)

    /* unsubscribe */
    unsub()

    ee.emit('e1')
    ee.emit('e2')
    sinon.assert.calledOnce(spy)
  })

  it('should work with early unsubscribe', async () => {
    const ee = new EventEmitter()
    const spy = sinon.spy()
    const unsub = onceAll('e1', 'e2')(spy)(ee)

    await wait(50)
    sinon.assert.notCalled(spy)

    /* early unsubscribe */
    unsub()

    await wait(50)
    ee.emit('e1')
    sinon.assert.notCalled(spy)

    await wait(50)
    ee.emit('e1')
    sinon.assert.notCalled(spy)

    await wait(50)
    ee.emit('e2')
    sinon.assert.notCalled(spy)
  })
})
