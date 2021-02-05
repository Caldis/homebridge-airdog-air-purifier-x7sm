import miio from 'miio'
import debounce from 'lodash.debounce'
import { SharedQueue } from './queue'
import { SharedFoundation } from './foundation'
import { getDeviceId, sleep } from '../MIoTDevice.utils'

const RE_CONNECT_THRESHOLD = 90000
const RE_CONNECT_FAILURE_THRESHOLD = 10000
const REQUEST_CONNECT_DEBOUNCE_THRESHOLD = 20

class Device {

  private device: { [address: string]: DeviceInstance | undefined } = {}

  private isConnected = (identify: MIoTDeviceIdentify) => {
    SharedFoundation.log.debug(`SHARED DEVICE CHECKING CONNECTING ${identify.name} ${identify.address}`, Date.now())
    const deviceInstance = this.device[identify.address]
    if (!deviceInstance) return false
    const now = Date.now()
    const diff = now - deviceInstance.timeout
    deviceInstance.timeout = now
    return diff < RE_CONNECT_THRESHOLD
  }
  private requestConnect = async (identify: MIoTDeviceIdentify) => {
    // Do connect
    try {
      // Log
      SharedFoundation.log.info(`${identify.name} ${identify.address} start ${!!this.device[identify.address] ? 're-' : ''}connecting.`)
      // Create device instance
      const device = await miio.device({
        address: identify.address,
        token: identify.token
      })
      device.did = getDeviceId(device.id)
      device.timeout = Date.now()
      // Update
      this.device[identify.address] = device
      // Resolve queues
      SharedQueue.resolve(identify, device)
      // Log
      SharedFoundation.log.info(`${identify.name} ${identify.address} connected.`)
    } catch (e) {
      // Retry if failure
      if (this.isConnected(identify)) return
      SharedFoundation.log.info(`${identify.name} ${identify.address} ${identify.token} connect failure, reconnecting ...`)
      SharedFoundation.log.error(e)
      await sleep(RE_CONNECT_FAILURE_THRESHOLD)
      await this.requestConnect(identify)
    }
  }
  private debounceRequestConnect = debounce(this.requestConnect, REQUEST_CONNECT_DEBOUNCE_THRESHOLD)

  public getInstance(identify: MIoTDeviceIdentify): Promise<DeviceInstance> {
    SharedFoundation.log.debug(`SHARED DEVICE GETTING INSTANCE ${identify.name} ${identify.address}`, Date.now())
    // return this.device[identify]
    return new Promise(resolve => {
      // Queue update
      SharedQueue.append(identify, resolve)
      // Trigger getter
      this.debounceRequestConnect(identify)
    })
  }

}

export const SharedDevice = new Device()

