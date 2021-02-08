import { AccessoryPlugin, Service } from 'homebridge'
import { MIIODevice, MiIdentify, SharedFoundation } from 'homebridge-mi-devices'
import {
  AirPurifierFanLevelCodeMapping, AirPurifierFanLevelGetCode,
  AirPurifierFanLevelSetCode, AirPurifierLockGetCode, AirPurifierLockSetCode, AirPurifierModeGetCode,
  AirPurifierModeSetCode,
  AirPurifierSwitchStatusGetCode,
  AirPurifierSwitchStatusSetCode,
  Specs
} from './AirDogAirPurifierX7SM.constant'

type Props = {
  identify: MiIdentify
}

export class AirDogAirPurifierX7SM implements AccessoryPlugin {

  // Requirement
  private readonly name: string
  private readonly token: string
  private readonly address: string
  // Services
  private readonly informationService: Service
  private readonly AirPurifierService: Service
  private readonly AirPurifierSleepModeService: Service
  private readonly AirPurifierSensorService: Service
  // Device
  private AirPurifierDevice: MIIODevice
  private AirPurifierSleepModeDevice: MIIODevice
  private AirPurifierSensorDevice: MIIODevice

  constructor (props: Props) {
    // Requirement
    this.name = props.identify.name
    this.token = props.identify.token
    this.address = props.identify.address
    // Information
    this.informationService = new SharedFoundation.hap.Service.AccessoryInformation()
      .setCharacteristic(SharedFoundation.hap.Characteristic.Manufacturer, 'AirDog')
      .setCharacteristic(SharedFoundation.hap.Characteristic.Model, 'X7S(m)')
    // AirPurifier
    const AirPurifierName = props.identify.name
    this.AirPurifierService = new SharedFoundation.hap.Service.AirPurifier(AirPurifierName)
    this.AirPurifierDevice = new MIIODevice({ ...props, characteristicsName: AirPurifierName, characteristicsService: this.AirPurifierService })
    this.AirPurifierSetup()
    // AirPurifier: Sleep mode
    const AirPurifierSleepModeName = `${props.identify.name}.SleepMode`
    this.AirPurifierSleepModeService = new SharedFoundation.hap.Service.Switch(AirPurifierSleepModeName)
    this.AirPurifierSleepModeDevice = new MIIODevice({ ...props, characteristicsName: AirPurifierSleepModeName, characteristicsService: this.AirPurifierSleepModeService })
    this.AirPurifierSleepModeSetup()
    // AirPurifier: Sensor
    const AirPurifierSensorName = `${props.identify.name}.Sensor`
    this.AirPurifierSensorService = new SharedFoundation.hap.Service.AirQualitySensor(AirPurifierSensorName)
    this.AirPurifierSensorDevice = new MIIODevice({ ...props, characteristicsName: AirPurifierSensorName, characteristicsService: this.AirPurifierSensorService })
    this.AirPurifierSensorSetup()
  }

  AirPurifierSetup = () => {
    this.AirPurifierDevice.addSpec(Specs)
    this.AirPurifierDevice.addCharacteristicListener(SharedFoundation.hap.Characteristic.Active, {
      get: {
        formatter: (valueMapping) => {
          return valueMapping[Specs.AirPurifierSwitchStatus] === AirPurifierSwitchStatusGetCode.On
            ? 1
            : 0
        }
      },
      set: {
        property: 'set_power',
        formatter: (value) => {
          // !!!!!!IMPORTANT: Set CurrentAirPurifierState Manually to prevent stuck in turning on/off
          const v = value as AirPurifierSwitchStatusSetCode
          this.AirPurifierService.updateCharacteristic(SharedFoundation.hap.Characteristic.CurrentAirPurifierState, v * 2)
          return [v]
        }
      },
    })
    this.AirPurifierDevice.addCharacteristicListener(SharedFoundation.hap.Characteristic.CurrentAirPurifierState, {
      get: {
        formatter: (valueMapping) =>
          valueMapping[Specs.AirPurifierSwitchStatus] === AirPurifierSwitchStatusGetCode.On
            ? 2
            : 0
      },
    })
    this.AirPurifierDevice.addCharacteristicListener(SharedFoundation.hap.Characteristic.TargetAirPurifierState, {
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
    this.AirPurifierDevice.addCharacteristicListener(SharedFoundation.hap.Characteristic.LockPhysicalControls, {
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
    this.AirPurifierDevice.addCharacteristicListener(SharedFoundation.hap.Characteristic.RotationSpeed, {
      get: {
        formatter: (valueMapping) =>
          AirPurifierFanLevelCodeMapping[valueMapping[Specs.AirPurifierFanLevel] as AirPurifierFanLevelGetCode]
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
  AirPurifierSleepModeSetup = () => {
    this.AirPurifierSleepModeDevice.addSpec(Specs)
    this.AirPurifierSleepModeDevice.addCharacteristicListener(SharedFoundation.hap.Characteristic.On, {
      get: {
        formatter: (valueMapping) =>
          valueMapping[Specs.AirPurifierMode] === AirPurifierModeGetCode.Sleep
            ? 1
            : 0
      },
      set: {
        property: 'set_wind',
        formatter: (value, previousProperty) =>
          value
            ? [AirPurifierModeSetCode.Sleep, previousProperty[Specs.AirPurifierFanLevel]]
            : [AirPurifierModeSetCode.Auto, previousProperty[Specs.AirPurifierFanLevel]]
      },
    })
  }
  AirPurifierSensorSetup = () => {
    this.AirPurifierSensorDevice.addSpec(Specs)
    this.AirPurifierSensorDevice.addCharacteristicListener(SharedFoundation.hap.Characteristic.StatusActive, {
      get: {
        formatter: (valueMapping) => {
          return valueMapping[Specs.AirPurifierSwitchStatus] === AirPurifierSwitchStatusGetCode.On
        }
      },
    })
    this.AirPurifierSensorDevice.addCharacteristicListener(SharedFoundation.hap.Characteristic.AirQuality, {
      get: {
        formatter: (valueMapping) => {
          let HCHOLevel
          const HCHO = valueMapping[Specs.EnvironmentHCHODensity]
          if (HCHO <= 3) {
            HCHOLevel = 1
          } else if (HCHO <= 5) {
            HCHOLevel = 2
          } else if (HCHO <= 8) {
            HCHOLevel = 3
          } else if (HCHO <= 12) {
            HCHOLevel = 4
          } else {
            HCHOLevel = 5
          }
          let PM25Level = valueMapping[Specs.EnvironmentPM25Density]
          if (PM25Level <= 35) {
            PM25Level = 1
          } else if (PM25Level <= 75) {
            PM25Level = 2
          } else if (PM25Level <= 115) {
            PM25Level = 3
          } else if (PM25Level <= 150) {
            PM25Level = 4
          } else {
            PM25Level = 5
          }
          return Math.min(HCHOLevel, PM25Level, 5)
        }
      },
    })
    this.AirPurifierSensorDevice.addCharacteristicListener(SharedFoundation.hap.Characteristic.PM2_5Density, {
      get: {
        formatter: (valueMapping) => valueMapping[Specs.EnvironmentPM25Density]
      },
    })
    this.AirPurifierSensorDevice.addCharacteristicListener(SharedFoundation.hap.Characteristic.VOCDensity, {
      get: {
        formatter: (valueMapping) => valueMapping[Specs.EnvironmentHCHODensity]
      },
    })
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify (): void {
    SharedFoundation.log.info(`Identifying ${this.name} ${this.address}`)
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices (): Service[] {
    return [
      this.informationService,
      this.AirPurifierService,
      this.AirPurifierSleepModeService,
      this.AirPurifierSensorService,
    ]
  }

}
