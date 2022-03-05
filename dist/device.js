"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = void 0;
const homebridge_mi_devices_1 = require("homebridge-mi-devices");
const device_constant_1 = require("./device.constant");
class Device {
    constructor(props) {
        this.AirPurifierSetup = () => {
            this.AirPurifierDevice.addCharacteristicListener(homebridge_mi_devices_1.Shared.hap.Characteristic.Active, {
                get: {
                    defaultValue: homebridge_mi_devices_1.Shared.hap.Characteristic.Active.INACTIVE,
                    formatter: (valueMapping) => {
                        return valueMapping[device_constant_1.Specs.AirPurifierSwitchStatus] === device_constant_1.AirPurifierSwitchStatusGetCode.On
                            ? homebridge_mi_devices_1.Shared.hap.Characteristic.Active.ACTIVE
                            : homebridge_mi_devices_1.Shared.hap.Characteristic.Active.INACTIVE;
                    }
                },
                set: {
                    property: 'set_power',
                    validator: (value, previousProperty) => {
                        let res = true;
                        const v = value;
                        switch (previousProperty[device_constant_1.Specs.AirPurifierSwitchStatus]) {
                            case device_constant_1.AirPurifierSwitchStatusGetCode.On:
                                res = v !== device_constant_1.AirPurifierSwitchStatusSetCode.On;
                                res && (previousProperty[device_constant_1.Specs.AirPurifierSwitchStatus] = device_constant_1.AirPurifierSwitchStatusGetCode.Off);
                                break;
                            case device_constant_1.AirPurifierSwitchStatusGetCode.Off:
                                res = v !== device_constant_1.AirPurifierSwitchStatusSetCode.Off;
                                res && (previousProperty[device_constant_1.Specs.AirPurifierSwitchStatus] = device_constant_1.AirPurifierSwitchStatusGetCode.On);
                                break;
                        }
                        return res;
                    },
                    formatter: (value) => {
                        // !!!!!!IMPORTANT: Set CurrentAirPurifierState Manually to prevent stuck in turning on/off
                        const v = value;
                        this.AirPurifierService.updateCharacteristic(homebridge_mi_devices_1.Shared.hap.Characteristic.CurrentAirPurifierState, v * 2);
                        return [v];
                    }
                },
            });
            this.AirPurifierDevice.addCharacteristicListener(homebridge_mi_devices_1.Shared.hap.Characteristic.CurrentAirPurifierState, {
                get: {
                    defaultValue: homebridge_mi_devices_1.Shared.hap.Characteristic.CurrentAirPurifierState.INACTIVE,
                    formatter: (valueMapping) => valueMapping[device_constant_1.Specs.AirPurifierSwitchStatus] === device_constant_1.AirPurifierSwitchStatusGetCode.On
                        ? homebridge_mi_devices_1.Shared.hap.Characteristic.CurrentAirPurifierState.PURIFYING_AIR
                        : homebridge_mi_devices_1.Shared.hap.Characteristic.CurrentAirPurifierState.INACTIVE
                },
            });
            this.AirPurifierDevice.addCharacteristicListener(homebridge_mi_devices_1.Shared.hap.Characteristic.TargetAirPurifierState, {
                get: {
                    defaultValue: homebridge_mi_devices_1.Shared.hap.Characteristic.TargetAirPurifierState.AUTO,
                    formatter: (valueMapping) => valueMapping[device_constant_1.Specs.AirPurifierMode] === device_constant_1.AirPurifierModeGetCode.Auto
                        ? homebridge_mi_devices_1.Shared.hap.Characteristic.TargetAirPurifierState.AUTO
                        : homebridge_mi_devices_1.Shared.hap.Characteristic.TargetAirPurifierState.MANUAL
                },
                set: {
                    property: 'set_wind',
                    validator: (value, previousProperty) => {
                        let res = true;
                        const v = value;
                        switch (previousProperty[device_constant_1.Specs.AirPurifierMode]) {
                            case device_constant_1.AirPurifierModeSetCode.Auto:
                                res = v !== device_constant_1.AirPurifierModeSetCode.Auto;
                                res && (previousProperty[device_constant_1.Specs.AirPurifierMode] = device_constant_1.AirPurifierModeSetCode.Manual);
                                break;
                            case device_constant_1.AirPurifierModeSetCode.Manual:
                                res = v !== device_constant_1.AirPurifierModeSetCode.Manual;
                                res && (previousProperty[device_constant_1.Specs.AirPurifierMode] = device_constant_1.AirPurifierModeSetCode.Auto);
                                break;
                            case device_constant_1.AirPurifierModeSetCode.Sleep:
                                res = v !== device_constant_1.AirPurifierModeSetCode.Sleep;
                                res && (previousProperty[device_constant_1.Specs.AirPurifierMode] = device_constant_1.AirPurifierModeSetCode.Auto);
                                break;
                        }
                        return res;
                    },
                    formatter: (value, previousProperty) => value === homebridge_mi_devices_1.Shared.hap.Characteristic.TargetAirPurifierState.AUTO
                        ? [device_constant_1.AirPurifierModeSetCode.Auto, previousProperty[device_constant_1.Specs.AirPurifierFanLevel]]
                        : [device_constant_1.AirPurifierModeSetCode.Manual, previousProperty[device_constant_1.Specs.AirPurifierFanLevel]]
                },
            });
            this.AirPurifierDevice.addCharacteristicListener(homebridge_mi_devices_1.Shared.hap.Characteristic.LockPhysicalControls, {
                get: {
                    defaultValue: homebridge_mi_devices_1.Shared.hap.Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED,
                    formatter: (valueMapping) => valueMapping[device_constant_1.Specs.PhysicalControlLocked] === device_constant_1.AirPurifierLockGetCode.Lock
                        ? homebridge_mi_devices_1.Shared.hap.Characteristic.LockPhysicalControls.CONTROL_LOCK_ENABLED
                        : homebridge_mi_devices_1.Shared.hap.Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED
                },
                set: {
                    property: 'set_lock',
                    formatter: (value) => value === homebridge_mi_devices_1.Shared.hap.Characteristic.LockPhysicalControls.CONTROL_LOCK_ENABLED
                        ? [device_constant_1.AirPurifierLockSetCode.Lock]
                        : [device_constant_1.AirPurifierLockSetCode.Unlock]
                },
            });
            this.AirPurifierDevice.addCharacteristicListener(homebridge_mi_devices_1.Shared.hap.Characteristic.RotationSpeed, {
                get: {
                    defaultValue: device_constant_1.AirPurifierFanLevelGetCode.Level1,
                    formatter: (valueMapping) => device_constant_1.AirPurifierFanLevelCodeMapping[valueMapping[device_constant_1.Specs.AirPurifierFanLevel]]
                },
                set: {
                    property: 'set_wind',
                    formatter: (value) => {
                        if (value <= 20) {
                            return [device_constant_1.AirPurifierModeSetCode.Manual, device_constant_1.AirPurifierFanLevelSetCode.Level1];
                        }
                        else if (value <= 40) {
                            return [device_constant_1.AirPurifierModeSetCode.Manual, device_constant_1.AirPurifierFanLevelSetCode.Level2];
                        }
                        else if (value <= 60) {
                            return [device_constant_1.AirPurifierModeSetCode.Manual, device_constant_1.AirPurifierFanLevelSetCode.Level3];
                        }
                        else if (value <= 80) {
                            return [device_constant_1.AirPurifierModeSetCode.Manual, device_constant_1.AirPurifierFanLevelSetCode.Level4];
                        }
                        else {
                            return [device_constant_1.AirPurifierModeSetCode.Manual, device_constant_1.AirPurifierFanLevelSetCode.Level5];
                        }
                    }
                },
            });
        };
        this.AirPurifierSleepModeSetup = (service) => {
            this.AirPurifierDevice.addCharacteristicListener(homebridge_mi_devices_1.Shared.hap.Characteristic.On, {
                service,
                get: {
                    defaultValue: 0,
                    formatter: (valueMapping) => valueMapping[device_constant_1.Specs.AirPurifierMode] === device_constant_1.AirPurifierModeGetCode.Sleep
                        ? 1
                        : 0
                },
                set: {
                    property: 'set_wind',
                    formatter: (value, previousProperty) => value
                        ? [device_constant_1.AirPurifierModeSetCode.Sleep, previousProperty[device_constant_1.Specs.AirPurifierFanLevel]]
                        : [device_constant_1.AirPurifierModeSetCode.Auto, previousProperty[device_constant_1.Specs.AirPurifierFanLevel]]
                },
            });
        };
        this.AirPurifierSensorSetup = (service) => {
            this.AirPurifierDevice.addCharacteristicListener(homebridge_mi_devices_1.Shared.hap.Characteristic.StatusActive, {
                service,
                get: {
                    defaultValue: false,
                    formatter: (valueMapping) => {
                        return valueMapping[device_constant_1.Specs.AirPurifierSwitchStatus] === device_constant_1.AirPurifierSwitchStatusGetCode.On;
                    }
                },
            });
            this.AirPurifierDevice.addCharacteristicListener(homebridge_mi_devices_1.Shared.hap.Characteristic.AirQuality, {
                service,
                get: {
                    defaultValue: 0,
                    formatter: (valueMapping) => {
                        let HCHOLevel;
                        const HCHO = valueMapping[device_constant_1.Specs.EnvironmentHCHODensity];
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
                        let PM25Level = valueMapping[device_constant_1.Specs.EnvironmentPM25Density];
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
            this.AirPurifierDevice.addCharacteristicListener(homebridge_mi_devices_1.Shared.hap.Characteristic.PM2_5Density, {
                service,
                get: {
                    defaultValue: 0,
                    formatter: (valueMapping) => valueMapping[device_constant_1.Specs.EnvironmentPM25Density]
                },
            });
            this.AirPurifierDevice.addCharacteristicListener(homebridge_mi_devices_1.Shared.hap.Characteristic.VOCDensity, {
                service,
                get: {
                    defaultValue: 0,
                    formatter: (valueMapping) => valueMapping[device_constant_1.Specs.EnvironmentHCHODensity]
                },
            });
        };
        // Requirement
        this.name = props.identify.name;
        this.token = props.identify.token;
        this.address = props.identify.address;
        // Information
        this.informationService = new homebridge_mi_devices_1.Shared.hap.Service.AccessoryInformation()
            .setCharacteristic(homebridge_mi_devices_1.Shared.hap.Characteristic.Category, 19 /* AIR_PURIFIER */)
            .setCharacteristic(homebridge_mi_devices_1.Shared.hap.Characteristic.Manufacturer, 'AirDog')
            .setCharacteristic(homebridge_mi_devices_1.Shared.hap.Characteristic.Model, 'X7S(m)');
        // AirPurifier
        this.AirPurifierService = new homebridge_mi_devices_1.Shared.hap.Service.AirPurifier(props.identify.name);
        this.AirPurifierDevice = new homebridge_mi_devices_1.MIIODevice({ ...props, service: this.AirPurifierService, specs: device_constant_1.Specs });
        this.AirPurifierSetup();
        // AirPurifier: Sleep mode
        this.AirPurifierSleepModeService = new homebridge_mi_devices_1.Shared.hap.Service.Switch(`${props.identify.name}.SleepMode`, 'SleepMode');
        this.AirPurifierSleepModeSetup(this.AirPurifierSleepModeService);
        // AirPurifier: Sensor
        this.AirPurifierSensorService = new homebridge_mi_devices_1.Shared.hap.Service.AirQualitySensor(`${props.identify.name}.Sensor`, 'Sensor');
        this.AirPurifierSensorSetup(this.AirPurifierSensorService);
    }
    /*
     * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
     * Typical this only ever happens at the pairing process.
     */
    identify() {
        homebridge_mi_devices_1.Shared.log.info(`Identifying ${this.name} ${this.address}`);
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
exports.Device = Device;
