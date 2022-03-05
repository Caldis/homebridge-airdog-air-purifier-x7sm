import { AccessoryPlugin, Service, Categories } from 'homebridge'
import { MIIODevice, MiIdentify, Shared } from 'homebridge-mi-devices'
import {
  AirPurifierFanLevelCodeMapping, AirPurifierFanLevelGetCode,
  AirPurifierFanLevelSetCode, AirPurifierLockGetCode, AirPurifierLockSetCode, AirPurifierModeGetCode,
  AirPurifierModeSetCode,
  AirPurifierSwitchStatusGetCode,
  AirPurifierSwitchStatusSetCode,
  Specs
} from './device.constant'

type Props = {
  identify: MiIdentify
}

export class Device implements AccessoryPlugin {

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

  constructor (props: Props) {
    // Requirement
    this.name = props.identify.name
    this.token = props.identify.token
    this.address = props.identify.address
    // Information
    this.informationService = new Shared.hap.Service.AccessoryInformation()
      .setCharacteristic(Shared.hap.Characteristic.Category, Categories.AIR_PURIFIER)
      .setCharacteristic(Shared.hap.Characteristic.Manufacturer, 'AirDog')
      .setCharacteristic(Shared.hap.Characteristic.Model, 'X7S(m)')
    // AirPurifier
    this.AirPurifierService = new Shared.hap.Service.AirPurifier(props.identify.name)
    this.AirPurifierDevice = new MIIODevice({ ...props, service: this.AirPurifierService, specs: Specs })
    this.AirPurifierSetup()
    // AirPurifier: Sleep mode
    this.AirPurifierSleepModeService = new Shared.hap.Service.Switch(`${props.identify.name}.SleepMode`, 'SleepMode')
    this.AirPurifierSleepModeSetup(this.AirPurifierSleepModeService)
    // AirPurifier: Sensor
    this.AirPurifierSensorService = new Shared.hap.Service.AirQualitySensor(`${props.identify.name}.Sensor`, 'Sensor')
    this.AirPurifierSensorSetup(this.AirPurifierSensorService)
  }

  AirPurifierSetup = () => {
    this.AirPurifierDevice.addCharacteristicListener(Shared.hap.Characteristic.Active, {
      get: {
        defaultValue: Shared.hap.Characteristic.Active.INACTIVE,
        formatter: (valueMapping) => {
          return valueMapping[Specs.AirPurifierSwitchStatus] === AirPurifierSwitchStatusGetCode.On
            ? Shared.hap.Characteristic.Active.ACTIVE
            : Shared.hap.Characteristic.Active.INACTIVE
        }
      },
      set: {
        property: 'set_power',
        validator: (value, previousProperty) => {
          let res = true
          const v = value as AirPurifierSwitchStatusSetCode
          switch (previousProperty[Specs.AirPurifierSwitchStatus]) {
            case AirPurifierSwitchStatusGetCode.On:
              res = v !== AirPurifierSwitchStatusSetCode.On
              res && (previousProperty[Specs.AirPurifierSwitchStatus] = AirPurifierSwitchStatusGetCode.Off)
              break
            case AirPurifierSwitchStatusGetCode.Off:
              res = v !== AirPurifierSwitchStatusSetCode.Off
              res && (previousProperty[Specs.AirPurifierSwitchStatus] = AirPurifierSwitchStatusGetCode.On)
              break
          }
          return res
        },
        formatter: (value) => {
          // !!!!!!IMPORTANT: Set CurrentAirPurifierState Manually to prevent stuck in turning on/off
          const v = value as AirPurifierSwitchStatusSetCode
          this.AirPurifierService.updateCharacteristic(Shared.hap.Characteristic.CurrentAirPurifierState, v * 2)
          return [v]
        }
      },
    })
    this.AirPurifierDevice.addCharacteristicListener(Shared.hap.Characteristic.CurrentAirPurifierState, {
      get: {
        defaultValue: Shared.hap.Characteristic.CurrentAirPurifierState.INACTIVE,
        formatter: (valueMapping) =>
          valueMapping[Specs.AirPurifierSwitchStatus] === AirPurifierSwitchStatusGetCode.On
            ? Shared.hap.Characteristic.CurrentAirPurifierState.PURIFYING_AIR
            : Shared.hap.Characteristic.CurrentAirPurifierState.INACTIVE
      },
    })
    this.AirPurifierDevice.addCharacteristicListener(Shared.hap.Characteristic.TargetAirPurifierState, {
      get: {
        defaultValue: Shared.hap.Characteristic.TargetAirPurifierState.AUTO,
        formatter: (valueMapping) =>
          valueMapping[Specs.AirPurifierMode] === AirPurifierModeGetCode.Auto
            ? Shared.hap.Characteristic.TargetAirPurifierState.AUTO
            : Shared.hap.Characteristic.TargetAirPurifierState.MANUAL
      },
      set: {
        property: 'set_wind', // [modeValue, speedValue]
        validator: (value, previousProperty) => {
          let res = true
          const v = value as AirPurifierModeSetCode
          switch (previousProperty[Specs.AirPurifierMode]) {
            case AirPurifierModeSetCode.Auto:
              res = v !== AirPurifierModeSetCode.Auto
              res && (previousProperty[Specs.AirPurifierMode] = AirPurifierModeSetCode.Manual)
              break
            case AirPurifierModeSetCode.Manual:
              res = v !== AirPurifierModeSetCode.Manual
              res && (previousProperty[Specs.AirPurifierMode] = AirPurifierModeSetCode.Auto)
              break
            case AirPurifierModeSetCode.Sleep:
              res = v !== AirPurifierModeSetCode.Sleep
              res && (previousProperty[Specs.AirPurifierMode] = AirPurifierModeSetCode.Auto)
              break
          }
          return res
        },
        formatter: (value, previousProperty) =>
          value === Shared.hap.Characteristic.TargetAirPurifierState.AUTO
            ? [AirPurifierModeSetCode.Auto, previousProperty[Specs.AirPurifierFanLevel]]
            : [AirPurifierModeSetCode.Manual, previousProperty[Specs.AirPurifierFanLevel]]
      },
    })
    this.AirPurifierDevice.addCharacteristicListener(Shared.hap.Characteristic.LockPhysicalControls, {
      get: {
        defaultValue: Shared.hap.Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED,
        formatter: (valueMapping) =>
          valueMapping[Specs.PhysicalControlLocked] === AirPurifierLockGetCode.Lock
            ? Shared.hap.Characteristic.LockPhysicalControls.CONTROL_LOCK_ENABLED
            : Shared.hap.Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED
      },
      set: {
        property: 'set_lock',
        formatter: (value) =>
          value === Shared.hap.Characteristic.LockPhysicalControls.CONTROL_LOCK_ENABLED
            ? [AirPurifierLockSetCode.Lock]
            : [AirPurifierLockSetCode.Unlock]
      },
    })
    this.AirPurifierDevice.addCharacteristicListener(Shared.hap.Characteristic.RotationSpeed, {
      get: {
        defaultValue: AirPurifierFanLevelGetCode.Level1,
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
  AirPurifierSleepModeSetup = (service: Service) => {
    this.AirPurifierDevice.addCharacteristicListener(Shared.hap.Characteristic.On, {
      service,
      get: {
        defaultValue: 0,
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
  AirPurifierSensorSetup = (service: Service) => {
    this.AirPurifierDevice.addCharacteristicListener(Shared.hap.Characteristic.StatusActive, {
      service,
      get: {
        defaultValue: false,
        formatter: (valueMapping) => {
          return valueMapping[Specs.AirPurifierSwitchStatus] === AirPurifierSwitchStatusGetCode.On
        }
      },
    })
    this.AirPurifierDevice.addCharacteristicListener(Shared.hap.Characteristic.AirQuality, {
      service,
      get: {
        defaultValue: 0,
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
    this.AirPurifierDevice.addCharacteristicListener(Shared.hap.Characteristic.PM2_5Density, {
      service,
      get: {
        defaultValue:0,
        formatter: (valueMapping) => valueMapping[Specs.EnvironmentPM25Density]
      },
    })
    this.AirPurifierDevice.addCharacteristicListener(Shared.hap.Characteristic.VOCDensity, {
      service,
      get: {
        defaultValue:0,
        formatter: (valueMapping) => valueMapping[Specs.EnvironmentHCHODensity]
      },
    })
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify (): void {
    Shared.log.info(`Identifying ${this.name} ${this.address}`)
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
