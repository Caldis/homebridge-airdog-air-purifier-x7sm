"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirDogAirPurifierX7SM = void 0;
const homebridge_miot_devices_1 = require("homebridge-miot-devices");
const AirDogAirPurifierX7SM_constant_1 = require("./AirDogAirPurifierX7SM.constant");
class AirDogAirPurifierX7SM {
    constructor(props) {
        this.AirPurifierSetup = () => {
            this.AirPurifierDevice.addMIIOSpec(AirDogAirPurifierX7SM_constant_1.Specs);
            this.AirPurifierDevice.addMIIOCharacteristicListener(homebridge_miot_devices_1.SharedFoundation.hap.Characteristic.Active, {
                get: {
                    formatter: (valueMapping) => {
                        return valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierSwitchStatus] === AirDogAirPurifierX7SM_constant_1.AirPurifierSwitchStatusGetCode.On
                            ? 1
                            : 0;
                    }
                },
                set: {
                    property: 'set_power',
                    formatter: (value) => {
                        // !!!!!!IMPORTANT: Set CurrentAirPurifierState Manually to prevent stuck in turning on/off
                        this.AirPurifierService.updateCharacteristic(homebridge_miot_devices_1.SharedFoundation.hap.Characteristic.CurrentAirPurifierState, value * 2);
                        return [value];
                    }
                },
            });
            this.AirPurifierDevice.addMIIOCharacteristicListener(homebridge_miot_devices_1.SharedFoundation.hap.Characteristic.CurrentAirPurifierState, {
                get: {
                    formatter: (valueMapping) => valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierSwitchStatus] === AirDogAirPurifierX7SM_constant_1.AirPurifierSwitchStatusGetCode.On
                        ? 2
                        : 0
                },
            });
            this.AirPurifierDevice.addMIIOCharacteristicListener(homebridge_miot_devices_1.SharedFoundation.hap.Characteristic.TargetAirPurifierState, {
                get: {
                    formatter: (valueMapping) => valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierMode] === AirDogAirPurifierX7SM_constant_1.AirPurifierModeGetCode.Auto ? 1 : 0
                },
                set: {
                    property: 'set_wind',
                    formatter: (value, previousProperty) => value === 1
                        ? [AirDogAirPurifierX7SM_constant_1.AirPurifierModeSetCode.Auto, previousProperty[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierFanLevel]]
                        : [AirDogAirPurifierX7SM_constant_1.AirPurifierModeSetCode.Manual, previousProperty[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierFanLevel]]
                },
            });
            this.AirPurifierDevice.addMIIOCharacteristicListener(homebridge_miot_devices_1.SharedFoundation.hap.Characteristic.LockPhysicalControls, {
                get: {
                    formatter: (valueMapping) => valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.PhysicalControlLocked] === AirDogAirPurifierX7SM_constant_1.AirPurifierLockGetCode.Lock
                        ? 1
                        : 0
                },
                set: {
                    property: 'set_lock',
                    formatter: (value) => value === 1
                        ? [AirDogAirPurifierX7SM_constant_1.AirPurifierLockSetCode.Lock]
                        : [AirDogAirPurifierX7SM_constant_1.AirPurifierLockSetCode.Unlock]
                },
            });
            this.AirPurifierDevice.addMIIOCharacteristicListener(homebridge_miot_devices_1.SharedFoundation.hap.Characteristic.RotationSpeed, {
                get: {
                    formatter: (valueMapping) => AirDogAirPurifierX7SM_constant_1.AirPurifierFanLevelCodeMapping[valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierFanLevel]]
                },
                set: {
                    property: 'set_wind',
                    formatter: (value) => {
                        if (value <= 20) {
                            return [AirDogAirPurifierX7SM_constant_1.AirPurifierModeSetCode.Manual, AirDogAirPurifierX7SM_constant_1.AirPurifierFanLevelSetCode.Level1];
                        }
                        else if (value <= 40) {
                            return [AirDogAirPurifierX7SM_constant_1.AirPurifierModeSetCode.Manual, AirDogAirPurifierX7SM_constant_1.AirPurifierFanLevelSetCode.Level2];
                        }
                        else if (value <= 60) {
                            return [AirDogAirPurifierX7SM_constant_1.AirPurifierModeSetCode.Manual, AirDogAirPurifierX7SM_constant_1.AirPurifierFanLevelSetCode.Level3];
                        }
                        else if (value <= 80) {
                            return [AirDogAirPurifierX7SM_constant_1.AirPurifierModeSetCode.Manual, AirDogAirPurifierX7SM_constant_1.AirPurifierFanLevelSetCode.Level4];
                        }
                        else {
                            return [AirDogAirPurifierX7SM_constant_1.AirPurifierModeSetCode.Manual, AirDogAirPurifierX7SM_constant_1.AirPurifierFanLevelSetCode.Level5];
                        }
                    }
                },
            });
        };
        this.AirPurifierSleepModeSetup = () => {
            this.AirPurifierSleepModeDevice.addMIIOSpec(AirDogAirPurifierX7SM_constant_1.Specs);
            this.AirPurifierSleepModeDevice.addMIIOCharacteristicListener(homebridge_miot_devices_1.SharedFoundation.hap.Characteristic.On, {
                get: {
                    formatter: (valueMapping) => valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierMode] === AirDogAirPurifierX7SM_constant_1.AirPurifierModeGetCode.Sleep
                        ? 1
                        : 0
                },
                set: {
                    property: 'set_wind',
                    formatter: (value, previousProperty) => value
                        ? [AirDogAirPurifierX7SM_constant_1.AirPurifierModeSetCode.Sleep, previousProperty[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierFanLevel]]
                        : [AirDogAirPurifierX7SM_constant_1.AirPurifierModeSetCode.Auto, previousProperty[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierFanLevel]]
                },
            });
        };
        this.AirPurifierSensorSetup = () => {
            this.AirPurifierSensorDevice.addMIIOSpec(AirDogAirPurifierX7SM_constant_1.Specs);
            this.AirPurifierSensorDevice.addMIIOCharacteristicListener(homebridge_miot_devices_1.SharedFoundation.hap.Characteristic.StatusActive, {
                get: {
                    formatter: (valueMapping) => {
                        return valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierSwitchStatus] === AirDogAirPurifierX7SM_constant_1.AirPurifierSwitchStatusGetCode.On;
                    }
                },
            });
            this.AirPurifierSensorDevice.addMIIOCharacteristicListener(homebridge_miot_devices_1.SharedFoundation.hap.Characteristic.AirQuality, {
                get: {
                    formatter: (valueMapping) => {
                        let HCHOLevel;
                        const HCHO = valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.EnvironmentHCHODensity];
                        if (HCHO <= 3) {
                            HCHOLevel = 1;
                        }
                        else if (HCHO <= 5) {
                            HCHOLevel = 2;
                        }
                        else if (HCHO <= 8) {
                            HCHOLevel = 3;
                        }
                        else if (HCHO <= 12) {
                            HCHOLevel = 4;
                        }
                        else {
                            HCHOLevel = 5;
                        }
                        let PM25Level = valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.EnvironmentPM25Density];
                        if (PM25Level <= 35) {
                            PM25Level = 1;
                        }
                        else if (PM25Level <= 75) {
                            PM25Level = 2;
                        }
                        else if (PM25Level <= 115) {
                            PM25Level = 3;
                        }
                        else if (PM25Level <= 150) {
                            PM25Level = 4;
                        }
                        else {
                            PM25Level = 5;
                        }
                        return Math.min(HCHOLevel, PM25Level, 5);
                    }
                },
            });
            this.AirPurifierSensorDevice.addMIIOCharacteristicListener(homebridge_miot_devices_1.SharedFoundation.hap.Characteristic.PM2_5Density, {
                get: {
                    formatter: (valueMapping) => valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.EnvironmentPM25Density]
                },
            });
            this.AirPurifierSensorDevice.addMIIOCharacteristicListener(homebridge_miot_devices_1.SharedFoundation.hap.Characteristic.VOCDensity, {
                get: {
                    formatter: (valueMapping) => valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.EnvironmentHCHODensity]
                },
            });
        };
        // Requirement
        this.name = props.identify.name;
        this.token = props.identify.token;
        this.address = props.identify.address;
        // Information
        this.informationService = new homebridge_miot_devices_1.SharedFoundation.hap.Service.AccessoryInformation()
            .setCharacteristic(homebridge_miot_devices_1.SharedFoundation.hap.Characteristic.Manufacturer, 'AirDog')
            .setCharacteristic(homebridge_miot_devices_1.SharedFoundation.hap.Characteristic.Model, 'X7S(m)');
        // AirPurifier
        this.AirPurifierService = new homebridge_miot_devices_1.SharedFoundation.hap.Service.AirPurifier(props.identify.name);
        this.AirPurifierDevice = new homebridge_miot_devices_1.MIoTDevice({ ...props, characteristicsService: this.AirPurifierService });
        this.AirPurifierSetup();
        // AirPurifier: Sleep mode
        this.AirPurifierSleepModeService = new homebridge_miot_devices_1.SharedFoundation.hap.Service.Switch(`${props.identify.name}.SleepMode`);
        this.AirPurifierSleepModeDevice = new homebridge_miot_devices_1.MIoTDevice({ ...props, characteristicsService: this.AirPurifierSleepModeService });
        this.AirPurifierSleepModeSetup();
        // AirPurifier: Sensor
        this.AirPurifierSensorService = new homebridge_miot_devices_1.SharedFoundation.hap.Service.AirQualitySensor(`${props.identify.name}.Sensor`);
        this.AirPurifierSensorDevice = new homebridge_miot_devices_1.MIoTDevice({ ...props, characteristicsService: this.AirPurifierSensorService });
        this.AirPurifierSensorSetup();
    }
    /*
     * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
     * Typical this only ever happens at the pairing process.
     */
    identify() {
        homebridge_miot_devices_1.SharedFoundation.log.info(`Identifying ${this.name} ${this.address}`);
    }
    /*
     * This method is called directly after creation of this instance.
     * It should return all services which should be added to the accessory.
     */
    getServices() {
        return [
            this.informationService,
            this.AirPurifierService,
            this.AirPurifierSleepModeService,
            this.AirPurifierSensorService,
        ];
    }
}
exports.AirDogAirPurifierX7SM = AirDogAirPurifierX7SM;