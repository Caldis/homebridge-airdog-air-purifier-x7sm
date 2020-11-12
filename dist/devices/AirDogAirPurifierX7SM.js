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
                    formatter: (valueMapping) => valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierSwitchStatus] ? 1 : 0
                },
                set: {
                    property: AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierSwitchStatus,
                    formatter: (value) => value
                },
            });
            this.device.addMIIOCharacteristicListener(this.hap.Characteristic.CurrentAirPurifierState, {
                get: {
                    formatter: (valueMapping) => valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierSwitchStatus] ? 2 : 0
                },
            });
            this.device.addMIIOCharacteristicListener(this.hap.Characteristic.TargetAirPurifierState, {
                get: {
                    formatter: (valueMapping) => {
                        return valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierMode] === AirDogAirPurifierX7SM_constant_1.AirPurifierModeCode.Sleep ? 1 : 0;
                    }
                },
                set: {
                    property: AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierMode,
                    formatter: (value) => value === 1 ? AirDogAirPurifierX7SM_constant_1.AirPurifierModeCode.Sleep : AirDogAirPurifierX7SM_constant_1.AirPurifierModeCode.Manual
                },
            });
            this.device.addMIIOCharacteristicListener(this.hap.Characteristic.LockPhysicalControls, {
                get: {
                    formatter: (valueMapping) => {
                        return valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.PhysicalControlLocked] ? 1 : 0;
                    }
                },
                set: {
                    property: AirDogAirPurifierX7SM_constant_1.Specs.PhysicalControlLocked,
                    formatter: (value) => value === 1 ? AirDogAirPurifierX7SM_constant_1.AirPurifierLockCode.Lock : AirDogAirPurifierX7SM_constant_1.AirPurifierLockCode.Unlock
                },
            });
            this.device.addMIIOCharacteristicListener(this.hap.Characteristic.RotationSpeed, {
                get: {
                    formatter: (valueMapping) => {
                        const value = valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierFanLevel];
                        return AirDogAirPurifierX7SM_constant_1.AirPurifierFanLevelCodeMapping[value];
                    }
                },
                set: {
                    property: AirDogAirPurifierX7SM_constant_1.Specs.AirPurifierFanLevel,
                    formatter: (value) => {
                        if (value <= 20) {
                            return AirDogAirPurifierX7SM_constant_1.AirPurifierFanLevelCode.Level1;
                        }
                        else if (value <= 40) {
                            return AirDogAirPurifierX7SM_constant_1.AirPurifierFanLevelCode.Level2;
                        }
                        else if (value <= 60) {
                            return AirDogAirPurifierX7SM_constant_1.AirPurifierFanLevelCode.Level3;
                        }
                        else if (value <= 80) {
                            return AirDogAirPurifierX7SM_constant_1.AirPurifierFanLevelCode.Level4;
                        }
                        else if (value <= 100) {
                            return AirDogAirPurifierX7SM_constant_1.AirPurifierFanLevelCode.Level5;
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