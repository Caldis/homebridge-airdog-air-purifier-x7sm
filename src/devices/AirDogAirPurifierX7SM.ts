import {
  AccessoryPlugin,
  CharacteristicEventTypes,
  CharacteristicGetCallback, CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service
} from 'homebridge'
import MIoTDevice, { MIoTDeviceIdentify } from '../MIoTDevice'
import {
  AirPurifierFanLevelCode,
  AirPurifierFanLevelCodeMapping,
  AirPurifierModeCode,
  Specs
} from './AirDogAirPurifierX7SM.constant'

type Props = {
  hap: HAP
  log: Logging
  identify: MIoTDeviceIdentify
}

export class AirDogAirPurifierX7SM implements AccessoryPlugin {

  // Requirement
  private readonly name: string
  private readonly token: string
  private readonly address: string
  // Foundation
  private readonly hap: HAP
  private readonly log: Logging
  // Services
  private readonly informationService: Service
  private readonly characteristicsService: Service
  // Device
  private device: MIoTDevice

  constructor (props: Props) {
    // Requirement
    this.name = props.identify.name
    this.token = props.identify.token
    this.address = props.identify.address
    // Foundation
    this.hap = props.hap
    this.log = props.log
    // Services
    this.informationService = new props.hap.Service.AccessoryInformation()
      .setCharacteristic(this.hap.Characteristic.Manufacturer, 'AirDog')
      .setCharacteristic(this.hap.Characteristic.Model, 'X7S(m)')
    this.characteristicsService = new this.hap.Service.AirPurifier(props.identify.name)
    // device
    this.device = new MIoTDevice({ ...props, characteristicsService: this.characteristicsService })
    // Registry
    // this.registrySpecs()
    this.registryCharacters()
  }

  // registrySpecs = () => {
    // Object.values(Specs).forEach(i => this.device.addSpec(i))
  // }
  registryCharacters = () => {
    const characteristic = this.characteristicsService.getCharacteristic(this.hap.Characteristic.Active)
    characteristic.on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
      try {
        this.log.debug(`GET START`, Date.now())
        // @ts-ignore
        const property = await this.device!.device!.miioCall('get_prop', ['power', 'mode', 'speed', 'lock', 'clean', 'pm', 'hcho'])
        // @ts-ignore
        this.log.debug(`GET SUCCESS`, property, property[0] === 'on' ? 1 : 0)
        // @ts-ignore
        callback(undefined, property[0] === 'on' ? 1 : 0)
      } catch (e) {
        this.log.error(`ERROR`, e)
        callback(e)
      }
    })
    characteristic.on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
      try {
        this.log.debug(`SET START`, Date.now(), value)
        // @ts-ignore
        // await this.device!.device!.miioCall('set_power', [value])
        this.log.debug(`SET SUCCESS`, value)
        callback(undefined, value)
      } catch (e) {
        this.log.error(`ERROR`, e)
        callback(e)
      }
    })


    // this.device.addCharacteristicListener(this.hap.Characteristic.Active, {
    //   get: {
    //     formatter: (valueMapping) => valueMapping[Specs.AirPurifierSwitchStatus.name] ? 1 : 0
    //   },
    //   set: {
    //     property: Specs.AirPurifierSwitchStatus.name,
    //     formatter: (value) => value === 1
    //   },
    // })
    // this.device.addCharacteristicListener(this.hap.Characteristic.CurrentAirPurifierState, {
    //   get: {
    //     formatter: (valueMapping) => valueMapping[Specs.AirPurifierSwitchStatus.name] ? 2 : 0
    //   },
    // })
    // this.device.addCharacteristicListener(this.hap.Characteristic.TargetAirPurifierState, {
    //   get: {
    //     formatter: (valueMapping) => {
    //       return valueMapping[Specs.AirPurifierMode.name] === AirPurifierModeCode.Auto ? 1 : 0
    //     }
    //   },
    //   set: {
    //     property: Specs.AirPurifierMode.name,
    //     formatter: (value) => value === 1 ? AirPurifierModeCode.Auto : AirPurifierModeCode.Sleep
    //   },
    // })
    // this.device.addCharacteristicListener(this.hap.Characteristic.LockPhysicalControls, {
    //   get: {
    //     formatter: (valueMapping) => {
    //       return valueMapping[Specs.PhysicalControlLocked.name] ? 1 : 0
    //     }
    //   },
    //   set: {
    //     property: Specs.PhysicalControlLocked.name,
    //     formatter: (value) => value === 1
    //   },
    // })
    // this.device.addCharacteristicListener(this.hap.Characteristic.RotationSpeed, {
    //   get: {
    //     formatter: (valueMapping) => {
    //       const value = valueMapping[Specs.AirPurifierFanLevel.name] as AirPurifierFanLevelCode
    //       return AirPurifierFanLevelCodeMapping[value]
    //     }
    //   },
    //   set: {
    //     property: Specs.AirPurifierFanLevel.name,
    //     formatter: (value) => {
    //       if (value <= 20) {
    //         return AirPurifierFanLevelCode.Level1
    //       } else if (value <= 40) {
    //         return AirPurifierFanLevelCode.Level2
    //       } else if (value <= 60) {
    //         return AirPurifierFanLevelCode.Level3
    //       } else if (value <= 80) {
    //         return AirPurifierFanLevelCode.Level4
    //       } else if (value <= 100) {
    //         return AirPurifierFanLevelCode.Level5
    //       }
    //     }
    //   },
    // })
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify (): void {
    this.log.info(`Identifying ${this.name} ${this.address}`)
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices (): Service[] {
    return [
      this.informationService,
      this.characteristicsService,
    ]
  }

}
