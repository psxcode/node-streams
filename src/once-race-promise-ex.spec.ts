import { expect } from 'chai'
import * as sinon from 'sinon'
import { EventEmitter } from 'events'
import { waitTimePromise as wait } from '@psxcode/wait'
import onceRacePromiseEx from './once-race-promise-ex'

describe('[ onceRacePromiseEx ]', () => {
  it('should resolve when one of events fires', async () => {
    const ee = new EventEmitter()
    const spy = sinon.spy()
    onceRacePromiseEx('e1', 'e2')(ee).then(spy)

    await wait(50)
    await wait(10)
    sinon.assert.notCalled(spy)

    await wait(50)
    ee.emit('e0', 'value0')
    await wait(10)
    sinon.assert.notCalled(spy)

    await wait(50)
    ee.emit('e1', 'value1')
    await wait(10)
    sinon.assert.calledOnce(spy)
    expect(spy.getCall(0).args[0]).deep.eq({ value: 'value1', index: 0, ee })

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
    onceRacePromiseEx('e1', 'e2')(ee0, ee1, ee2).then(spy)

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
    expect(spy.getCall(0).args[0]).deep.eq({ value: 'value1', index: 1, ee: ee1 })

    await wait(50)
    ee2.emit('e2')
    await wait(10)
    sinon.assert.calledOnce(spy)
  })
})
