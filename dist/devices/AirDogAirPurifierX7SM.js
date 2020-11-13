"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirDogAirPurifierX7SM = void 0;
const MIoTDevice_1 = __importDefault(require("../MIoTDevice"));
const AirDogAirPurifierX7SM_constant_1 = require("./AirDogAirPurifierX7SM.constant");
class AirDogAirPurifierX7SM {
    constructor(props) {
        this.registrySpecs = () => {
            Object.values(AirDogAirPurifierX7SM_constant_1.Specs).forEach(i => this.device.addMIIOSpec(i));
        };
        this.registryCharacters = () => {
            this.device.addMIIOCharacteristicListener(this.hap.Characteristic.Active, {
                get: {
                    formatter: (valueMapping) => valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierSwitchStatus] === AirDogAirPurifierX7SM_constant_1.AirPurifierSwitchStatusGetCode.On
                        ? 1
                        : 0
                },
                set: {
                    property: 'set_power',
                    formatter: (value) => [value]
                },
            });
            this.device.addMIIOCharacteristicListener(this.hap.Characteristic.CurrentAirPurifierState, {
                get: {
                    formatter: (valueMapping) => valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierSwitchStatus] === AirDogAirPurifierX7SM_constant_1.AirPurifierSwitchStatusGetCode.On
                        ? 2
                        : 0
                },
            });
            this.device.addMIIOCharacteristicListener(this.hap.Characteristic.TargetAirPurifierState, {
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
            this.device.addMIIOCharacteristicListener(this.hap.Characteristic.LockPhysicalControls, {
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
            this.device.addMIIOCharacteristicListener(this.hap.Characteristic.SwingMode, {
                get: {
                    formatter: (valueMapping) => valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierMode] === AirDogAirPurifierX7SM_constant_1.AirPurifierModeGetCode.Sleep
                        ? 1
                        : 0
                },
                set: {
                    property: 'set_wind',
                    formatter: (value, previousProperty) => value === 1
                        ? [AirDogAirPurifierX7SM_constant_1.AirPurifierModeSetCode.Sleep, previousProperty[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierFanLevel]]
                        : [AirDogAirPurifierX7SM_constant_1.AirPurifierModeSetCode.Auto, previousProperty[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierFanLevel]]
                },
            });
            this.device.addMIIOCharacteristicListener(this.hap.Characteristic.RotationSpeed, {
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
        // Requirement
        this.name = props.identify.name;
        this.token = props.identify.token;
        this.address = props.identify.address;
        // Foundation
        this.hap = props.hap;
        this.log = props.log;
        // Services
        this.informationService = new props.hap.Service.AccessoryInformation()
            .setCharacteristic(this.hap.Characteristic.Manufacturer, 'AirDog')
            .setCharacteristic(this.hap.Characteristic.Model, 'X7S(m)');
        this.characteristicsService = new this.hap.Service.AirPurifier(props.identify.name);
        // device
        this.device = new MIoTDevice_1.default({ ...props, characteristicsService: this.characteristicsService });
        // Registry
        this.registrySpecs();
        this.registryCharacters();
    }
    /*
     * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
     * Typical this only ever happens at the pairing process.
     */
    identify() {
        this.log.info(`Identifying ${this.name} ${this.address}`);
    }
    /*
     * This method is called directly after creation of this instance.
     * It should return all services which should be added to the accessory.
     */
    getServices() {
        return [
            this.informationService,
            this.characteristicsService,
        ];
    }
}
exports.AirDogAirPurifierX7SM = AirDogAirPurifierX7SM;
//# sourceMappingURL=AirDogAirPurifierX7SM.js.map