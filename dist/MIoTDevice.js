"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_debounce_1 = __importDefault(require("lodash.debounce"));
const foundation_1 = require("./shared/foundation");
const device_1 = require("./shared/device");
var ErrorMessages;
(function (ErrorMessages) {
    ErrorMessages["NotConnect"] = "Device not connected.";
    ErrorMessages["SpecNotFound"] = "Spec not found.";
})(ErrorMessages || (ErrorMessages = {}));
const REQUEST_PROPERTY_DEBOUNCE_THRESHOLD = 100;
class MIoTDevice {
    constructor(props) {
        // Properties: MIoT
        this.MIoTPreviousProperties = {};
        this.MIoTSpecsMapping = {};
        this.MIoTSpecsQueue = [];
        // Properties: MIIO
        this.MIIOPreviousProperties = {};
        this.MIIOSpecsMapping = {};
        this.MIIOSpecsQueue = [];
        /*
         * MIoT
         */
        // Spec
        this.addMIoTSpec = (specs) => {
            Object.values(specs).forEach(i => this.MIoTSpecsMapping[i.name] = i);
        };
        this.getMIoTSpec = async (device, name) => {
            // Action: getAll
            if (!name)
                return Object.values(this.MIoTSpecsMapping).map(i => ({ ...i, did: device.did }));
            // Action: getByName
            const targetSpecs = [];
            if (Array.isArray(name)) {
                name.forEach(i => {
                    const spec = this.MIoTSpecsMapping[i];
                    if (spec)
                        targetSpecs.push({ ...spec, did: device.did });
                });
            }
            else {
                const spec = this.MIoTSpecsMapping[name];
                if (spec)
                    targetSpecs.push({ ...spec, did: device.did });
            }
            return targetSpecs;
        };
        // Properties
        // Merging request by debounce
        // When HomeBridge device is in initialization
        // multiple requests will be triggered in order to request the corresponding target value.
        // These fragmentation request will cause the MIoT device to refuse to response or weak performance
        // and cause the Accessory display "Not Response" in iOS Home app.
        this.debounceRequestMIoTProperty = lodash_debounce_1.default(async () => {
            // Guard
            const device = await device_1.SharedDevice.getInstance(this.identify);
            if (!(device === null || device === void 0 ? void 0 : device.did))
                throw new Error(ErrorMessages.NotConnect);
            // Spec
            const targetSpecs = await this.getMIoTSpec(device);
            // Pull queue
            const queue = [...this.MIoTSpecsQueue];
            this.MIoTSpecsQueue = [];
            // Get properties
            const properties = await device.miioCall('get_properties', targetSpecs);
            this.MIoTPreviousProperties = targetSpecs.reduce((acc, cur, idx) => ({
                ...acc,
                [cur.name]: properties[idx].value
            }), {});
            foundation_1.SharedFoundation.log.debug(`MIoT Merging request of ${this.identify.name} ${this.identify.address}`);
            queue.forEach(resolve => resolve(this.MIoTPreviousProperties));
        }, REQUEST_PROPERTY_DEBOUNCE_THRESHOLD);
        this.setMIoTProperty = async (name, value) => {
            // Guard
            const device = await device_1.SharedDevice.getInstance(this.identify);
            if (!(device === null || device === void 0 ? void 0 : device.did))
                throw new Error(ErrorMessages.NotConnect);
            // Spec
            const targetSpec = this.MIoTSpecsMapping[name];
            if (!targetSpec)
                throw new Error(ErrorMessages.SpecNotFound);
            // Action
            return device.miioCall('set_properties', [Object.assign(targetSpec, { value, did: device.did })]);
        };
        // Events
        this.pullMIoTProperty = async () => {
            // Action
            return new Promise((resolve => {
                // Queue update
                this.MIoTSpecsQueue.push(resolve);
                // Trigger Property getter
                this.debounceRequestMIoTProperty();
            }));
        };
        /*
         * MIIO
         */
        // Spec
        this.addMIIOSpec = (specs) => {
            Object.values(specs).forEach(i => this.MIIOSpecsMapping[i] = i);
        };
        this.getMIIOSpec = async (name) => {
            // Action: getAll
            if (!name)
                return Object.values(this.MIIOSpecsMapping);
            // Action: getByName
            if (Array.isArray(name)) {
                return name;
            }
            else {
                return [name];
            }
        };
        // Properties
        // Merging request by debounce
        this.debounceRequestMIIOProperty = lodash_debounce_1.default(async () => {
            // Guard
            const device = await device_1.SharedDevice.getInstance(this.identify);
            if (!(device === null || device === void 0 ? void 0 : device.did))
                throw new Error(ErrorMessages.NotConnect);
            // Spec
            const targetSpecs = await this.getMIIOSpec();
            // Pull queue
            const queue = [...this.MIIOSpecsQueue];
            this.MIIOSpecsQueue = [];
            // Get properties
            const properties = await device.miioCall('get_prop', targetSpecs);
            foundation_1.SharedFoundation.log.debug('MIIO Properties', properties);
            this.MIIOPreviousProperties = targetSpecs.reduce((acc, cur, idx) => ({
                ...acc,
                [cur]: properties[idx]
            }), {});
            foundation_1.SharedFoundation.log.debug(`MIIO Merging request of ${this.identify.name} ${this.identify.address}`);
            queue.forEach(resolve => resolve(this.MIIOPreviousProperties));
        }, REQUEST_PROPERTY_DEBOUNCE_THRESHOLD);
        this.setMIIOProperty = async (name, value) => {
            // Guard
            const device = await device_1.SharedDevice.getInstance(this.identify);
            if (!(device === null || device === void 0 ? void 0 : device.did))
                throw new Error(ErrorMessages.NotConnect);
            // Action
            return device.miioCall(name, value);
        };
        // Events
        this.pullMIIOProperty = async () => {
            // Action
            return new Promise((resolve => {
                // Queue update
                this.MIIOSpecsQueue.push(resolve);
                // Trigger Property getter
                this.debounceRequestMIIOProperty();
            }));
        };
        // HomeBridge
        this.characteristicsService = props.characteristicsService;
        // Device
        this.identify = props.identify;
    }
    addMIoTCharacteristicListener(type, config) {
        const characteristic = this.characteristicsService.getCharacteristic(type);
        if ('get' in config) {
            characteristic.on("get" /* GET */, async (callback) => {
                try {
                    foundation_1.SharedFoundation.log.debug(`MIoT START GETTING ${type.name}`, Date.now());
                    const property = await this.pullMIoTProperty();
                    const propertyFormatted = config.get.formatter(property);
                    callback(undefined, propertyFormatted);
                    foundation_1.SharedFoundation.log.debug(`MIoT GETTING ${type.name} SUCCESS `, propertyFormatted);
                }
                catch (e) {
                    foundation_1.SharedFoundation.log.error(`MIoT GETTING ${type.name} ERROR`, e);
                    callback(e);
                }
            });
        }
        if ('set' in config) {
            const set = config.set;
            if (set) {
                characteristic.on("set" /* SET */, async (value, callback) => {
                    try {
                        foundation_1.SharedFoundation.log.debug(`MIoT START SETTING ${type.name}`, Date.now());
                        const valueFormatted = set.formatter(value, this.MIoTPreviousProperties);
                        await this.setMIoTProperty(set.property, valueFormatted);
                        callback(undefined, value);
                        foundation_1.SharedFoundation.log.debug(`MIoT SETTING ${type.name} SUCCESS`, valueFormatted);
                    }
                    catch (e) {
                        foundation_1.SharedFoundation.log.error(`MIoT SETTING ERROR ${type.name}`, e);
                        callback(e);
                    }
                });
            }
        }
    }
    addMIIOCharacteristicListener(type, config) {
        const characteristic = this.characteristicsService.getCharacteristic(type);
        if ('get' in config) {
            characteristic.on("get" /* GET */, async (callback) => {
                try {
                    foundation_1.SharedFoundation.log.debug(`MIIO START GETTING ${type.name}`, Date.now());
                    const property = await this.pullMIIOProperty();
                    const propertyFormatted = config.get.formatter(property);
                    callback(undefined, propertyFormatted);
                    foundation_1.SharedFoundation.log.debug(`MIIO GETTING ${type.name} SUCCESS`, propertyFormatted);
                }
                catch (e) {
                    foundation_1.SharedFoundation.log.error(`MIIO GETTING ${type.name} ERROR`, e);
                    callback(e);
                }
            });
        }
        if ('set' in config) {
            const set = config.set;
            if (set) {
                characteristic.on("set" /* SET */, async (value, callback) => {
                    try {
                        foundation_1.SharedFoundation.log.debug(`MIIO START SETTING ${type.name}`, Date.now());
                        const valueFormatted = set.formatter(value, this.MIIOPreviousProperties);
                        await this.setMIIOProperty(set.property, valueFormatted);
                        callback(undefined, value);
                        foundation_1.SharedFoundation.log.debug(`MIIO SETTING ${type.name} SUCCESS`, valueFormatted);
                    }
                    catch (e) {
                        foundation_1.SharedFoundation.log.error(`MIIO SETTING ${type.name} ERROR`, e);
                        callback(e);
                    }
                });
            }
        }
    }
}
exports.default = MIoTDevice;
//# sourceMappingURL=MIoTDevice.js.map