import { EventEmitter } from 'events'
import { expect } from 'chai'
import * as sinon from 'sinon'
import { waitTimePromise as wait } from '@psxcode/wait'
import onceRaceEx from './once-race-ex'

describe('[ onceRaceEx ]', () => {
  it('should work', async () => {
    const ee = new EventEmitter()
    const spy = sinon.spy()
    const unsub = onceRaceEx('e1', 'e2')(spy)(ee)

    await wait(50)
    sinon.assert.notCalled(spy)

    await wait(50)
    ee.emit('e0')
    sinon.assert.notCalled(spy)

    await wait(50)
    ee.emit('e1', 'value1')
    sinon.assert.callCount(spy, 1)
    expect(spy.getCall(0).args[0]).deep.eq({ value: 'value1', index: 0, ee })

    await wait(50)
    ee.emit('e1')
    sinon.assert.callCount(spy, 1)

    await wait(50)
    ee.emit('e2')
    sinon.assert.callCount(spy, 1)

    /* unsubscribe */
    unsub()

    ee.emit('e1')
    ee.emit('e2')
    sinon.assert.callCount(spy, 1)
  })

  it('should work with multiple ees', async () => {
    const ee0 = new EventEmitter()
    const ee1 = new EventEmitter()
    const ee2 = new EventEmitter()
    const spy = sinon.spy()
    const unsub = onceRaceEx('e1', 'e2')(spy)(ee0, ee1, ee2)

    await wait(50)
    sinon.assert.notCalled(spy)

    await wait(50)
    ee0.emit('e0', 'value0')
    sinon.assert.notCalled(spy)

    await wait(50)
    ee1.emit('e1', 'value1')
    sinon.assert.callCount(spy, 1)
    expect(spy.getCall(0).args[0]).deep.eq({ value: 'value1', index: 1, ee: ee1 })

    await wait(50)
    ee0.emit('e1', 'value2')
    sinon.assert.callCount(spy, 1)

    await wait(50)
    ee2.emit('e2', 'value3')
    sinon.assert.callCount(spy, 1)

    /* unsubscribe */
    unsub()

    ee0.emit('e1')
    ee1.emit('e2')
    sinon.assert.callCount(spy, 1)
  })

  it('should work with early unsubscribe', async () => {
    const ee = new EventEmitter()
    const spy = sinon.spy()
    const unsub = onceRaceEx('e1', 'e2')(spy)(ee)

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
