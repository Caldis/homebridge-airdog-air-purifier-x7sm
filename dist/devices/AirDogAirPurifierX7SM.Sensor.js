"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirDogAirPurifierX7SMSensor = void 0;
const MIoTDevice_1 = __importDefault(require("../MIoTDevice"));
const AirDogAirPurifierX7SM_constant_1 = require("./AirDogAirPurifierX7SM.constant");
class AirDogAirPurifierX7SMSensor {
    constructor(props) {
        this.registrySpecs = () => {
            Object.values(AirDogAirPurifierX7SM_constant_1.Specs).forEach(i => this.device.addMIIOSpec(i));
        };
        this.registryCharacters = () => {
            this.device.addMIIOCharacteristicListener(this.hap.Characteristic.AirQuality, {
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
                        return Math.min(HCHOLevel, PM25Level);
                    }
                },
            });
            this.device.addMIIOCharacteristicListener(this.hap.Characteristic.PM2_5Density, {
                get: {
                    formatter: (valueMapping) => valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.EnvironmentPM25Density]
                },
            });
            this.device.addMIIOCharacteristicListener(this.hap.Characteristic.VOCDensity, {
                get: {
                    formatter: (valueMapping) => valueMapping[AirDogAirPurifierX7SM_constant_1.Specs.EnvironmentHCHODensity]
                },
            });
        };
        // Requirement
        this.name = `${props.identify.name}.Sensor`;
        this.token = props.identify.token;
        this.address = props.identify.address;
        // Foundation
        this.hap = props.hap;
        this.log = props.log;
        // Services
        this.informationService = new props.hap.Service.AccessoryInformation()
            .setCharacteristic(this.hap.Characteristic.Manufacturer, 'AirDog')
            .setCharacteristic(this.hap.Characteristic.Model, 'X7S(m).Sensor');
        this.characteristicsService = new this.hap.Service.AirQualitySensor(this.name);
        // device
        this.device = new MIoTDevice_1.default({ ...props, identify: { ...props.identify, name: this.name }, characteristicsService: this.characteristicsService });
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
exports.AirDogAirPurifierX7SMSensor = AirDogAirPurifierX7SMSensor;
//# sourceMappingURL=AirDogAirPurifierX7SM.Sensor.js.map