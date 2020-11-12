import { AccessoryPlugin, HAP, Logging, Service } from 'homebridge'
import MIoTDevice, { MIoTDeviceIdentify } from '../MIoTDevice'
import {
  AirPurifierFanLevelCode,
  AirPurifierFanLevelCodeMapping,
  AirPurifierLockCode,
  AirPurifierModeCode, AirPurifierSwitchStatusCode,
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
    this.registrySpecs()
    this.registryCharacters()
  }

  registrySpecs = () => {
    Object.values(Specs).forEach(i => this.device.addMIIOSpec(i))
  }
  registryCharacters = () => {
    this.device.addMIIOCharacteristicListener(this.hap.Characteristic.Active, {
      get: {
        formatter: (valueMapping) => valueMapping[Specs.AirPurifierSwitchStatus] ? 1 : 0
      },
      set: {
        property: Specs.AirPurifierSwitchStatus,
        formatter: (value) => value
      },
    })
    this.device.addMIIOCharacteristicListener(this.hap.Characteristic.CurrentAirPurifierState, {
      get: {
        formatter: (valueMapping) => valueMapping[Specs.AirPurifierSwitchStatus] ? 2 : 0
      },
    })
    this.device.addMIIOCharacteristicListener(this.hap.Characteristic.TargetAirPurifierState, {
      get: {
        formatter: (valueMapping) => {
          return valueMapping[Specs.AirPurifierMode] === AirPurifierModeCode.Sleep ? 1 : 0
        }
      },
      set: {
        property: Specs.AirPurifierMode,
        formatter: (value) => value === 1 ? AirPurifierModeCode.Sleep : AirPurifierModeCode.Manual
      },
    })
    this.device.addMIIOCharacteristicListener(this.hap.Characteristic.LockPhysicalControls, {
      get: {
        formatter: (valueMapping) => {
          return valueMapping[Specs.PhysicalControlLocked] ? 1 : 0
        }
      },
      set: {
        property: Specs.PhysicalControlLocked,
        formatter: (value) => value === 1 ? AirPurifierLockCode.Lock : AirPurifierLockCode.Unlock
      },
    })
    this.device.addMIIOCharacteristicListener(this.hap.Characteristic.RotationSpeed, {
      get: {
        formatter: (valueMapping) => {
          const value = valueMapping[Specs.AirPurifierFanLevel] as AirPurifierFanLevelCode
          return AirPurifierFanLevelCodeMapping[value]
        }
      },
      set: {
        property: Specs.AirPurifierFanLevel,
        formatter: (value) => {
          if (value <= 20) {
            return AirPurifierFanLevelCode.Level1
          } else if (value <= 40) {
            return AirPurifierFanLevelCode.Level2
          } else if (value <= 60) {
            return AirPurifierFanLevelCode.Level3
          } else if (value <= 80) {
            return AirPurifierFanLevelCode.Level4
          } else if (value <= 100) {
            return AirPurifierFanLevelCode.Level5
          }
        }
      },
    })
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
