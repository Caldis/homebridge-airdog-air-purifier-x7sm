import { AccessoryPlugin, HAP, Logging, Service } from 'homebridge'
import MIoTDevice, { MIoTDeviceIdentify } from '../MIoTDevice'
import {
  AirPurifierFanLevelCodeMapping, AirPurifierFanLevelGetCode,
  AirPurifierFanLevelSetCode, AirPurifierLockGetCode, AirPurifierLockSetCode, AirPurifierModeGetCode,
  AirPurifierModeSetCode,
  AirPurifierSwitchStatusGetCode,
  AirPurifierSwitchStatusSetCode,
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
        formatter: (valueMapping) =>
          valueMapping[Specs.AirPurifierSwitchStatus] === AirPurifierSwitchStatusGetCode.On
            ? 1
            : 0
      },
      set: {
        property: 'set_power',
        formatter: (value: AirPurifierSwitchStatusSetCode) => [value]
      },
    })
    this.device.addMIIOCharacteristicListener(this.hap.Characteristic.CurrentAirPurifierState, {
      get: {
        formatter: (valueMapping) =>
          valueMapping[Specs.AirPurifierSwitchStatus] === AirPurifierSwitchStatusGetCode.On
            ? 2
            : 0
      },
    })
    this.device.addMIIOCharacteristicListener(this.hap.Characteristic.TargetAirPurifierState, {
      get: {
        formatter: (valueMapping) =>
          valueMapping[Specs.AirPurifierMode] === AirPurifierModeGetCode.Auto ? 1 : 0
      },
      set: {
        property: 'set_wind', // [modeValue, speedValue]
        formatter: (value, previousProperty) =>
          value === 1
            ? [AirPurifierModeSetCode.Auto, previousProperty[Specs.AirPurifierFanLevel]]
            : [AirPurifierModeSetCode.Manual, previousProperty[Specs.AirPurifierFanLevel]]
      },
    })
    this.device.addMIIOCharacteristicListener(this.hap.Characteristic.LockPhysicalControls, {
      get: {
        formatter: (valueMapping) =>
          valueMapping[Specs.PhysicalControlLocked] === AirPurifierLockGetCode.Lock
            ? 1
            : 0
      },
      set: {
        property: 'set_lock',
        formatter: (value) =>
          value === 1
            ? [AirPurifierLockSetCode.Lock]
            : [AirPurifierLockSetCode.Unlock]
      },
    })
    this.device.addMIIOCharacteristicListener(this.hap.Characteristic.SwingMode, {
      get: {
        formatter: (valueMapping) =>
          valueMapping[Specs.AirPurifierMode] === AirPurifierModeGetCode.Sleep
            ? 1
            : 0
      },
      set: {
        property: 'set_wind',
        formatter: (value, previousProperty) =>
          value === 1
            ? [AirPurifierModeSetCode.Sleep, previousProperty[Specs.AirPurifierFanLevel]]
            : [AirPurifierModeSetCode.Auto, previousProperty[Specs.AirPurifierFanLevel]]
      },
    })
    this.device.addMIIOCharacteristicListener(this.hap.Characteristic.RotationSpeed, {
      get: {
        formatter: (valueMapping) =>
          AirPurifierFanLevelCodeMapping[
            valueMapping[Specs.AirPurifierFanLevel] as AirPurifierFanLevelGetCode
          ]
      },
      set: {
        property: 'set_wind',
        formatter: (value) => {
          if (value <= 20) {
            return [AirPurifierModeSetCode.Manual, AirPurifierFanLevelSetCode.Level1]
          } else if (value <= 40) {
            return [AirPurifierModeSetCode.Manual, AirPurifierFanLevelSetCode.Level2]
          } else if (value <= 60) {
            return [AirPurifierModeSetCode.Manual, AirPurifierFanLevelSetCode.Level3]
          } else if (value <= 80) {
            return [AirPurifierModeSetCode.Manual, AirPurifierFanLevelSetCode.Level4]
          } else {
            return [AirPurifierModeSetCode.Manual, AirPurifierFanLevelSetCode.Level5]
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
