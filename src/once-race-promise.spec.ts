import { expect } from 'chai'
import * as sinon from 'sinon'
import { EventEmitter } from 'events'
import { waitTimePromise as wait } from '@psxcode/wait'
import onceRacePromise from './once-race-promise'

describe('[ onceRacePromise ]', () => {
  it('should resolve when one of events fires', async () => {
    const ee = new EventEmitter()
    const spy = sinon.spy()
    onceRacePromise('e1', 'e2')(ee).then(spy)

    await wait(50)
    sinon.assert.notCalled(spy)

    await wait(50)
    ee.emit('e0', 'value0')
    await wait(10)
    sinon.assert.notCalled(spy)

    await wait(50)
    ee.emit('e1', 'value1')
    await wait(10)
    sinon.assert.calledOnce(spy)
    expect(spy.getCall(0).args[0]).eq('value1')

    await wait(50)
    ee.emit('e2')
    await wait(10)
    sinon.assert.calledOnce(spy)
  })

  it('should resolve when one of events fires', async () => {
    const ee0 = new EventEmitter()
    const ee1 = new EventEmitter()
    const ee2 = new EventEmitter()
    const spy = sinon.spy()
    onceRacePromise('e1', 'e2')(ee0, ee1, ee2).then(spy)

    await wait(50)
    sinon.assert.notCalled(spy)

    await wait(50)
    ee0.emit('e0', 'value0')
    await wait(10)
    sinon.assert.notCalled(spy)

    await wait(50)
    ee1.emit('e1', 'value1')
    await wait(10)
    sinon.assert.calledOnce(spy)
    expect(spy.getCall(0).args[0]).eq('value1')

    await wait(50)
    ee2.emit('e2')
    await wait(10)
    sinon.assert.calledOnce(spy)
  })
})
