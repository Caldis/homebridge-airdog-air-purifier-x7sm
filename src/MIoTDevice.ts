import debounce from 'lodash.debounce'
import {
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  Service,
} from 'homebridge'
import { SharedFoundation } from './shared/foundation'
import { SharedDevice } from './shared/device'

type Props = {
  identify: MIoTDeviceIdentify
  characteristicsService: Service
}
type RegisterConfig<T> = {
  name?: string,
  get: { formatter: (valueMapping: MIoTSpecsResponseValueMapping) => any }
  set?: { formatter: (value: any, previousProperty: T) => any[]; property: string }
}
enum ErrorMessages {
  NotConnect = 'Device not connected.',
  SpecNotFound = 'Spec not found.',
}

const REQUEST_PROPERTY_DEBOUNCE_THRESHOLD = 100

export default class MIoTDevice {

  // Requirement
  private readonly characteristicsService: Service
  // Device
  private readonly identify: MIoTDeviceIdentify
  // Properties: MIoT
  private MIoTPreviousProperties: MIoTSpecsResponseValueMapping = {}
  private MIoTSpecsMapping: MIoTSpecMapping = {}
  private MIoTSpecsQueue: ((valueMapping: MIoTSpecsResponseValueMapping) => void)[] = []
  // Properties: MIIO
  private MIIOPreviousProperties: MIIOSpecResponseValueMapping = {}
  private MIIOSpecsMapping: MIIOSpecMapping = {}
  private MIIOSpecsQueue: ((valueMapping: MIIOSpecResponseValueMapping) => void)[] = []

  constructor (props: Props) {
    // HomeBridge
    this.characteristicsService = props.characteristicsService
    // Device
    this.identify = props.identify
  }

  /*
   * MIoT
   */
  // Spec
  public addMIoTSpec = (spec: MIoTSpec) => {
    this.MIoTSpecsMapping[spec.name] = spec
  }
  public getMIoTSpec = async (name?: string | string[]) => {
    // Guard
    const device = await SharedDevice.getInstance(this.identify)
    if (!device?.did) throw new Error(ErrorMessages.NotConnect)
    // Action: getAll
    if (!name) return Object.values(this.MIoTSpecsMapping).map(i => ({ ...i, did: device.did }))
    // Action: getByName
    const targetSpecs: MIoTSpecsGetQuery = []
    if (Array.isArray(name)) {
      name.forEach(i => {
        const spec = this.MIoTSpecsMapping[i]
        if (spec) targetSpecs.push({ ...spec, did: device.did })
      })
    } else {
      const spec = this.MIoTSpecsMapping[name]
      if (spec) targetSpecs.push({ ...spec, did: device.did })
    }
    return targetSpecs
  }
  // Properties
  // Merging request by debounce
  // When HomeBridge device is in initialization
  // multiple requests will be triggered in order to request the corresponding target value.
  // These fragmentation request will cause the MIoT device to refuse to response or weak performance
  // and cause the Accessory display "Not Response" in iOS Home app.
  private debounceRequestMIoTProperty = debounce(async (device: DeviceInstance) => {
    // Spec
    const targetSpecs = await this.getMIoTSpec()
    // Pull queue
    const queue = [...this.MIoTSpecsQueue]
    this.MIoTSpecsQueue = []
    // Get properties
    const properties = await device.miioCall('get_properties', targetSpecs)
    this.MIoTPreviousProperties = targetSpecs.reduce((acc, cur, idx) => ({
      ...acc,
      [cur.name]: properties[idx].value
    }), {} as MIoTSpecsResponseValueMapping)
    SharedFoundation.log.debug(`MIoT Merging request of ${this.identify.name} ${this.identify.address}`)
    queue.forEach(resolve => resolve(this.MIoTPreviousProperties))
  }, REQUEST_PROPERTY_DEBOUNCE_THRESHOLD)
  public setMIoTProperty = async <T extends any> (name: string, value: T) => {
    // Guard
    const device = await SharedDevice.getInstance(this.identify)
    if (!device?.did) throw new Error(ErrorMessages.NotConnect)
    // Spec
    const targetSpec = this.MIoTSpecsMapping[name]
    if (!targetSpec) throw new Error(ErrorMessages.SpecNotFound)
    // Action
    return device.miioCall<T>('set_properties', [Object.assign(targetSpec, { value, did: device.did })])
  }
  // Events
  private pullMIoTProperty = async (): Promise<MIoTSpecsResponseValueMapping> => {
    // Guard
    const device = await SharedDevice.getInstance(this.identify)
    if (!device?.did) throw new Error(ErrorMessages.NotConnect)
    // Action
    return new Promise((resolve => {
      // Queue update
      this.MIoTSpecsQueue.push(resolve)
      // Trigger Property getter
      this.debounceRequestMIoTProperty(device)
    }))
  }
  public addMIoTCharacteristicListener(type: any, config: RegisterConfig<MIoTSpecsResponseValueMapping>) {
    const characteristic = this.characteristicsService.getCharacteristic(type)
    if ('get' in config) {
      characteristic.on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        try {
          SharedFoundation.log.debug(`MIoT START GETTING ${type.name}`, Date.now())
          const property = await this.pullMIoTProperty()
          const propertyFormatted = config.get.formatter(property)
          callback(undefined, propertyFormatted)
          SharedFoundation.log.debug(`MIoT GETTING ${type.name} SUCCESS `, propertyFormatted)
        } catch (e) {
          SharedFoundation.log.error(`MIoT GETTING ${type.name} ERROR`, e)
          callback(e)
        }
      })
    }
    if ('set' in config) {
      const set = config.set
      if (set) {
        characteristic.on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
          try {
            SharedFoundation.log.debug(`MIoT START SETTING ${type.name}`, Date.now())
            const valueFormatted = set.formatter(value, this.MIoTPreviousProperties)
            await this.setMIoTProperty(set.property, valueFormatted)
            callback(undefined, value)
            SharedFoundation.log.debug(`MIoT SETTING ${type.name} SUCCESS`, valueFormatted)
          } catch (e) {
            SharedFoundation.log.error(`MIoT SETTING ERROR ${type.name}`, e)
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
  private debounceRequestMIIOProperty = debounce(async (device: DeviceInstance) => {
    // Spec
    const targetSpecs = await this.getMIIOSpec()
    // Pull queue
    const queue = [...this.MIIOSpecsQueue]
    this.MIIOSpecsQueue = []
    // Get properties
    const properties = await device.miioCall('get_prop', targetSpecs)
    SharedFoundation.log.debug('MIIO Properties', properties)
    this.MIIOPreviousProperties = targetSpecs.reduce((acc, cur, idx) => ({
      ...acc,
      [cur]: properties[idx]
    }), {} as MIIOSpecResponseValueMapping)
    SharedFoundation.log.debug(`MIIO Merging request of ${this.identify.name} ${this.identify.address}`)
    queue.forEach(resolve => resolve(this.MIIOPreviousProperties))
  }, REQUEST_PROPERTY_DEBOUNCE_THRESHOLD)
  public setMIIOProperty = async <T extends (string | number)> (name: string, value: any[]) => {
    // Guard
    const device = await SharedDevice.getInstance(this.identify)
    if (!device?.did) throw new Error(ErrorMessages.NotConnect)
    // Action
    return device.miioCall<T>(name, value)
  }
  // Events
  private pullMIIOProperty = async (): Promise<MIIOSpecResponseValueMapping> => {
    // Guard
    const device = await SharedDevice.getInstance(this.identify)
    if (!device?.did) throw new Error(ErrorMessages.NotConnect)
    // Action
    return new Promise((resolve => {
      // Queue update
      this.MIIOSpecsQueue.push(resolve)
      // Trigger Property getter
      this.debounceRequestMIIOProperty(device)
    }))
  }
  public addMIIOCharacteristicListener(type: any, config: RegisterConfig<MIIOSpecResponseValueMapping>) {
    const characteristic = this.characteristicsService.getCharacteristic(type)
    if ('get' in config) {
      characteristic.on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        try {
          SharedFoundation.log.debug(`MIIO START GETTING ${type.name}`, Date.now())
          const property = await this.pullMIIOProperty()
          const propertyFormatted = config.get.formatter(property)
          callback(undefined, propertyFormatted)
          SharedFoundation.log.debug(`MIIO GETTING ${type.name} SUCCESS`, propertyFormatted)
        } catch (e) {
          SharedFoundation.log.error(`MIIO GETTING ${type.name} ERROR`, e)
          callback(e)
        }
      })
    }
    if ('set' in config) {
      const set = config.set
      if (set) {
        characteristic.on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
          try {
            SharedFoundation.log.debug(`MIIO START SETTING ${type.name}`, Date.now())
            const valueFormatted = set.formatter(value, this.MIIOPreviousProperties)
            await this.setMIIOProperty(set.property, valueFormatted)
            callback(undefined, value)
            SharedFoundation.log.debug(`MIIO SETTING ${type.name} SUCCESS`, valueFormatted)
          } catch (e) {
            SharedFoundation.log.error(`MIIO SETTING ${type.name} ERROR`, e)
            callback(e)
          }
        })
      }
    }
  }
}
