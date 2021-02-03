import debounce from 'lodash.debounce'
import {
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP, Logging, Service,
} from 'homebridge'
import { getDeviceId, sleep } from './MIoTDevice.utils'
import miio, {
  DeviceInstance, MIIOSpec, MIIOSpecMapping, MIIOSpecResponseValueMapping,
  MIOTSpec,
  MIOTSpecMapping,
  MIOTSpecsGetQuery,
  MIOTSpecsResponseValueMapping
} from 'miio'

export type MIoTDeviceIdentify = { name: string; token: string; address: string; }

type Props = {
  hap: HAP
  log: Logging
  identify: MIoTDeviceIdentify
  characteristicsService: Service
}
type RegisterConfig<T> = {
  name?: string,
  get: { formatter: (valueMapping: MIOTSpecsResponseValueMapping) => any }
  set?: { formatter: (value: any, previousProperty: T) => any[]; property: string }
}
enum ErrorMessages {
  NotConnect = 'Device not connected.',
  SpecNotFound = 'Spec not found.',
}

const RE_CONNECT_THRESHOLD = 90000
const REQUEST_CONNECT_DEBOUNCE_THRESHOLD = 100
const REQUEST_PROPERTY_DEBOUNCE_THRESHOLD = 100
const CONNECTION_POOL: { [address: string]: DeviceInstance } = {}
const CONNECTION_QUEUE: { [address: string]: ((...args: any[]) => void)[] } = {}


export default class MIoTDevice {

  // Requirement
  private readonly log: Logging
  private readonly hap: HAP
  private readonly characteristicsService: Service
  // Device
  private readonly identify: MIoTDeviceIdentify
  get deviceConnectQueue () {
    if (!Array.isArray(CONNECTION_QUEUE[this.identify.address])) {
      CONNECTION_QUEUE[this.identify.address] = []
    }
    return CONNECTION_QUEUE[this.identify.address]
  }
  set deviceConnectQueue(value) {
    CONNECTION_QUEUE[this.identify.address] = value
  }
  get device () {
    return CONNECTION_POOL[this.identify.address]
  }
  set device (value) {
    CONNECTION_POOL[this.identify.address] = value
  }
  // Properties
  private MIoTPreviousProperties: MIOTSpecsResponseValueMapping = {}
  private MIoTSpecsMapping: MIOTSpecMapping = {}
  private MIoTSpecsQueue: ((valueMapping: MIOTSpecsResponseValueMapping) => void)[] = []
  private MIIOPreviousProperties: MIIOSpecResponseValueMapping = {}
  private MIIOSpecsMapping: MIIOSpecMapping = {}
  private MIIOSpecsQueue: ((valueMapping: MIIOSpecResponseValueMapping) => void)[] = []

  constructor (props: Props) {
    // HomeBridge
    this.hap = props.hap
    this.log = props.log
    this.characteristicsService = props.characteristicsService
    // Device
    this.identify = props.identify
    // Connect
    ;(async () => this.connect())()
  }

  // Flags
  get isConnected () {
    const now = Date.now()
    const flag = !!this.device && (now - this.device.timeout < RE_CONNECT_THRESHOLD)
    if (!!this.device && flag) {
      this.device.timeout = now
    }
    return flag
  }

  // Connection
  private debounceRequestConnect = debounce(async () => {
    // Device
    try {
      this.log.info(`${this.identify.name} ${this.identify.address} start ${!!this.device ? 're-' : ''}connecting.`)
      // Pull queue
      const queue = [...this.deviceConnectQueue]
      this.deviceConnectQueue = []
      // Create miio device instance
      const device = await miio.device({
        address: this.identify.address,
        token: this.identify.token,
      })
      // Extract deviceId and attach to instance
      device.did = getDeviceId(device.id)
      device.timeout = Date.now()
      // Update and resolve
      this.device = device
      queue.forEach(resolve => resolve())
      // Logger
      this.log.info(`${this.identify.name} ${this.identify.address} connected.`)
      return true
    } catch (e) {
      // Retry if failure
      if (!this.isConnected) {
        this.log.info(`${this.identify.name} ${this.identify.address} connect failure, reconnecting ...`, e)
        await sleep(5000)
        await this.connect()
      }
      return true
    }
  }, REQUEST_CONNECT_DEBOUNCE_THRESHOLD)
  private connect = async () => {
    return new Promise(resolve => {
      // Queue update
      this.deviceConnectQueue.push(resolve)
      // Trigger Property getter
      this.debounceRequestConnect()
    })
  }

  /*
   * MIoT
   */
  // Spec
  public addMIoTSpec = (spec: MIOTSpec) => {
    this.MIoTSpecsMapping[spec.name] = spec
  }
  public getMIoTSpec = async (name?: string | string[]) => {
    // Guard
    if (!this.isConnected) await this.connect()
    if (!this.device?.did) throw new Error(ErrorMessages.NotConnect)
    const did = this.device.did
    // Action: getAll
    if (!name) return Object.values(this.MIoTSpecsMapping).map(i => ({ ...i, did }))
    // Action: getByName
    const targetSpecs: MIOTSpecsGetQuery = []
    if (Array.isArray(name)) {
      name.forEach(i => {
        const spec = this.MIoTSpecsMapping[i]
        if (spec) targetSpecs.push({ ...spec, did })
      })
    } else {
      const spec = this.MIoTSpecsMapping[name]
      if (spec) targetSpecs.push({ ...spec, did })
    }
    return targetSpecs
  }
  // Properties
  // Merging request by debounce
  // When HomeBridge device is in initialization
  // multiple requests will be triggered in order to request the corresponding target value.
  // These fragmentation request will cause the MIoT device to refuse to response or weak performance
  // and cause the Accessory display "Not Response" in iOS Home app.
  private debounceRequestMIoTProperty = debounce(async () => {
    // Spec
    const targetSpecs = await this.getMIoTSpec()
    // Pull queue
    const queue = [...this.MIoTSpecsQueue]
    this.MIoTSpecsQueue = []
    // Get properties
    const properties = await this.device!.miioCall('get_properties', targetSpecs)
    this.MIoTPreviousProperties = targetSpecs.reduce((acc, cur, idx) => ({
      ...acc,
      [cur.name]: properties[idx].value
    }), {} as MIOTSpecsResponseValueMapping)
    this.log.debug(`MIoT Merging request of ${this.identify.name} ${this.identify.address}`)
    queue.forEach(resolve => resolve(this.MIoTPreviousProperties))
  }, REQUEST_PROPERTY_DEBOUNCE_THRESHOLD)
  public setMIoTProperty = async <T extends any> (name: string, value: T) => {
    // Guard
    if (!this.isConnected) await this.connect()
    if (!this.device?.did) throw new Error(ErrorMessages.NotConnect)
    const did = this.device.did
    // Spec
    const targetSpec = this.MIoTSpecsMapping[name]
    if (!targetSpec) throw new Error(ErrorMessages.SpecNotFound)
    // Action
    return this.device.miioCall<T>('set_properties', [Object.assign(targetSpec, { did, value })])
  }
  // Events
  private pullMIoTProperty = async (): Promise<MIOTSpecsResponseValueMapping> => {
    // Guard
    if (!this.isConnected) await this.connect()
    if (!this.device?.did) throw new Error(ErrorMessages.NotConnect)
    // Action
    return new Promise((resolve => {
      // Queue update
      this.MIoTSpecsQueue.push(resolve)
      // Trigger Property getter
      this.debounceRequestMIoTProperty()
    }))
  }
  public addMIoTCharacteristicListener(type: any, config: RegisterConfig<MIOTSpecsResponseValueMapping>) {
    const characteristic = this.characteristicsService.getCharacteristic(type)
    if ('get' in config) {
      characteristic.on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        try {
          this.log.debug(`MIoT START GETTING ${type.name}`, Date.now())
          const property = await this.pullMIoTProperty()
          const propertyFormatted = config.get.formatter(property)
          callback(undefined, propertyFormatted)
          this.log.debug(`MIoT GETTING ${type.name} SUCCESS `, propertyFormatted)
        } catch (e) {
          this.log.error(`MIoT GETTING ${type.name} ERROR`, e)
          callback(e)
        }
      })
    }
    if ('set' in config) {
      const set = config.set
      if (set) {
        characteristic.on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
          try {
            this.log.debug(`MIoT START SETTING ${type.name}`, Date.now())
            const valueFormatted = set.formatter(value, this.MIoTPreviousProperties)
            await this.setMIoTProperty(set.property, valueFormatted)
            callback(undefined, value)
            this.log.debug(`MIoT SETTING ${type.name} SUCCESS`, valueFormatted)
          } catch (e) {
            this.log.error(`MIoT SETTING ERROR ${type.name}`, e)
            callback(e)
          }
        })
      }
    }
  }

  /*
   * MIIO
   */
  // Spec
  public addMIIOSpec = (spec: MIIOSpec) => {
    this.MIIOSpecsMapping[spec] = spec
  }
  public getMIIOSpec = async (name?: string | string[]) => {
    // Action: getAll
    if (!name) return Object.values(this.MIIOSpecsMapping)
    // Action: getByName
    if (Array.isArray(name)) {
      return name
    } else {
      return [name]
    }
  }
  // Properties
  // Merging request by debounce
  private debounceRequestMIIOProperty = debounce(async () => {
    // Spec
    const targetSpecs = await this.getMIIOSpec()
    // Pull queue
    const queue = [...this.MIIOSpecsQueue]
    this.MIIOSpecsQueue = []
    // Get properties
    const properties = await this.device!.miioCall('get_prop', targetSpecs)
    this.log.debug('MIIO Properties', properties)
    this.MIIOPreviousProperties = targetSpecs.reduce((acc, cur, idx) => ({
      ...acc,
      [cur]: properties[idx]
    }), {} as MIIOSpecResponseValueMapping)
    this.log.debug(`MIIO Merging request of ${this.identify.name} ${this.identify.address}`)
    queue.forEach(resolve => resolve(this.MIIOPreviousProperties))
  }, REQUEST_PROPERTY_DEBOUNCE_THRESHOLD)
  public setMIIOProperty = async <T extends (string | number)> (name: string, value: any[]) => {
    // Guard
    if (!this.isConnected) await this.connect()
    // Action
    return this.device?.miioCall<T>(name, value)
  }
  // Events
  private pullMIIOProperty = async (): Promise<MIIOSpecResponseValueMapping> => {
    // Guard
    if (!this.isConnected) await this.connect()
    // Action
    return new Promise((resolve => {
      // Queue update
      this.MIIOSpecsQueue.push(resolve)
      // Trigger Property getter
      this.debounceRequestMIIOProperty()
    }))
  }
  public addMIIOCharacteristicListener(type: any, config: RegisterConfig<MIIOSpecResponseValueMapping>) {
    const characteristic = this.characteristicsService.getCharacteristic(type)
    if ('get' in config) {
      characteristic.on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        try {
          this.log.debug(`MIIO START GETTING ${type.name}`, Date.now())
          const property = await this.pullMIIOProperty()
          const propertyFormatted = config.get.formatter(property)
          callback(undefined, propertyFormatted)
          this.log.debug(`MIIO GETTING ${type.name} SUCCESS`, propertyFormatted)
        } catch (e) {
          this.log.error(`MIIO GETTING ${type.name} ERROR`, e)
          callback(e)
        }
      })
    }
    if ('set' in config) {
      const set = config.set
      if (set) {
        characteristic.on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
          try {
            this.log.debug(`MIIO START SETTING ${type.name}`, Date.now())
            const valueFormatted = set.formatter(value, this.MIIOPreviousProperties)
            await this.setMIIOProperty(set.property, valueFormatted)
            callback(undefined, value)
            this.log.debug(`MIIO SETTING ${type.name} SUCCESS`, valueFormatted)
          } catch (e) {
            this.log.error(`MIIO SETTING ${type.name} ERROR`, e)
            callback(e)
          }
        })
      }
    }
  }
}
