"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_debounce_1 = __importDefault(require("lodash.debounce"));
const MIoTDevice_utils_1 = require("./MIoTDevice.utils");
const miio_1 = __importDefault(require("miio"));
var ErrorMessages;
(function (ErrorMessages) {
    ErrorMessages["NotConnect"] = "Device not connected.";
    ErrorMessages["SpecNotFound"] = "Spec not found.";
})(ErrorMessages || (ErrorMessages = {}));
const RE_CONNECT_THRESHOLD = 90000;
const REQUEST_CONNECT_DEBOUNCE_THRESHOLD = 100;
const REQUEST_PROPERTY_DEBOUNCE_THRESHOLD = 100;
class MIoTDevice {
    constructor(props) {
        this.deviceConnectQueue = [];
        // Properties
        this.MIoTPreviousProperties = {};
        this.MIoTSpecsMapping = {};
        this.MIoTSpecsQueue = [];
        this.MIIOPreviousProperties = {};
        this.MIIOSpecsMapping = {};
        this.MIIOSpecsQueue = [];
        // Connection
        this.debounceRequestConnect = lodash_debounce_1.default(async () => {
            // Device
            try {
                this.log.info(`${this.identify.name} ${this.identify.address} start ${!!this.device ? 're-' : ''}connecting.`);
                // Pull queue
                const queue = [...this.deviceConnectQueue];
                this.deviceConnectQueue = [];
                // Create miio device instance
                const device = await miio_1.default.device({
                    address: this.identify.address,
                    token: this.identify.token,
                });
                // Extract deviceId and attach to instance
                device.did = MIoTDevice_utils_1.getDeviceId(device.id);
                device.timeout = Date.now();
                // Logger
                this.device = device;
                queue.forEach(resolve => resolve());
                this.log.info(`${this.identify.name} ${this.identify.address} connected.`);
                return true;
            }
            catch (e) {
                // Retry if failure
                if (!this.isConnected) {
                    this.log.info(`${this.identify.name} ${this.identify.address} connect failure, reconnecting ...`, e);
                    await MIoTDevice_utils_1.sleep(5000);
                    await this.connect();
                }
                return true;
            }
        }, REQUEST_CONNECT_DEBOUNCE_THRESHOLD);
        this.connect = async () => {
            return new Promise(resolve => {
                // Queue update
                this.deviceConnectQueue.push(resolve);
                // Trigger Property getter
                this.debounceRequestConnect();
            });
        };
        /*
         * MIoT
         */
        // Spec
        this.addMIoTSpec = (spec) => {
            this.MIoTSpecsMapping[spec.name] = spec;
        };
        this.getMIoTSpec = async (name) => {
            var _a;
            // Guard
            if (!this.isConnected)
                await this.connect();
            if (!((_a = this.device) === null || _a === void 0 ? void 0 : _a.did))
                throw new Error(ErrorMessages.NotConnect);
            const did = this.device.did;
            // Action: getAll
            if (!name)
                return Object.values(this.MIoTSpecsMapping).map(i => ({ ...i, did }));
            // Action: getByName
            const targetSpecs = [];
            if (Array.isArray(name)) {
                name.forEach(i => {
                    const spec = this.MIoTSpecsMapping[i];
                    if (spec)
                        targetSpecs.push({ ...spec, did });
                });
            }
            else {
                const spec = this.MIoTSpecsMapping[name];
                if (spec)
                    targetSpecs.push({ ...spec, did });
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
            // Spec
            const targetSpecs = await this.getMIoTSpec();
            // Pull queue
            const queue = [...this.MIoTSpecsQueue];
            this.MIoTSpecsQueue = [];
            // Get properties
            const properties = await this.device.miioCall('get_properties', targetSpecs);
            this.MIoTPreviousProperties = targetSpecs.reduce((acc, cur, idx) => ({
                ...acc,
                [cur.name]: properties[idx].value
            }), {});
            this.log.debug(`MIoT Merging request of ${this.identify.name} ${this.identify.address}`);
            queue.forEach(resolve => resolve(this.MIoTPreviousProperties));
        }, REQUEST_PROPERTY_DEBOUNCE_THRESHOLD);
        this.setMIoTProperty = async (name, value) => {
            var _a;
            // Guard
            if (!this.isConnected)
                await this.connect();
            if (!((_a = this.device) === null || _a === void 0 ? void 0 : _a.did))
                throw new Error(ErrorMessages.NotConnect);
            const did = this.device.did;
            // Spec
            const targetSpec = this.MIoTSpecsMapping[name];
            if (!targetSpec)
                throw new Error(ErrorMessages.SpecNotFound);
            // Action
            return this.device.miioCall('set_properties', [Object.assign(targetSpec, { did, value })]);
        };
        // Events
        this.pullMIoTProperty = async () => {
            var _a;
            // Guard
            if (!this.isConnected)
                await this.connect();
            if (!((_a = this.device) === null || _a === void 0 ? void 0 : _a.did))
                throw new Error(ErrorMessages.NotConnect);
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
        this.addMIIOSpec = (spec) => {
            this.MIIOSpecsMapping[spec] = spec;
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
            // Spec
            const targetSpecs = await this.getMIIOSpec();
            // Pull queue
            const queue = [...this.MIIOSpecsQueue];
            this.MIIOSpecsQueue = [];
            // Get properties
            const properties = await this.device.miioCall('get_prop', targetSpecs);
            this.log.debug('MIIO Properties', properties);
            this.MIIOPreviousProperties = targetSpecs.reduce((acc, cur, idx) => ({
                ...acc,
                [cur]: properties[idx]
            }), {});
            this.log.debug(`MIIO Merging request of ${this.identify.name} ${this.identify.address}`);
            queue.forEach(resolve => resolve(this.MIIOPreviousProperties));
        }, REQUEST_PROPERTY_DEBOUNCE_THRESHOLD);
        this.setMIIOProperty = async (name, value) => {
            var _a;
            // Guard
            if (!this.isConnected)
                await this.connect();
            // Action
            return (_a = this.device) === null || _a === void 0 ? void 0 : _a.miioCall(name, value);
        };
        // Events
        this.pullMIIOProperty = async () => {
            // Guard
            if (!this.isConnected)
                await this.connect();
            // Action
            return new Promise((resolve => {
                // Queue update
                this.MIIOSpecsQueue.push(resolve);
                // Trigger Property getter
                this.debounceRequestMIIOProperty();
            }));
        };
        // HomeBridge
        this.hap = props.hap;
        this.log = props.log;
        this.characteristicsService = props.characteristicsService;
        // Device
        this.identify = props.identify;
        (async () => this.connect())();
    }
    // Flags
    get isConnected() {
        const now = Date.now();
        const flag = !!this.device && (now - this.device.timeout < RE_CONNECT_THRESHOLD);
        if (!!this.device && flag) {
            this.device.timeout = now;
        }
        return flag;
    }
    addMIoTCharacteristicListener(type, config) {
        const characteristic = this.characteristicsService.getCharacteristic(type);
        if ('get' in config) {
            characteristic.on("get" /* GET */, async (callback) => {
                try {
                    this.log.debug(`MIoT START GETTING ${type.name}`, Date.now());
                    const property = await this.pullMIoTProperty();
                    const propertyFormatted = config.get.formatter(property);
                    callback(undefined, propertyFormatted);
                    this.log.debug(`MIoT GETTING ${type.name} SUCCESS `, propertyFormatted);
                }
                catch (e) {
                    this.log.error(`MIoT GETTING ${type.name} ERROR`, e);
                    callback(e);
                }
            });
        }
        if ('set' in config) {
            const set = config.set;
            if (set) {
                characteristic.on("set" /* SET */, async (value, callback) => {
                    try {
                        this.log.debug(`MIoT START SETTING ${type.name}`, Date.now());
                        const valueFormatted = set.formatter(value, this.MIoTPreviousProperties);
                        await this.setMIoTProperty(set.property, valueFormatted);
                        callback(undefined, value);
                        this.log.debug(`MIoT SETTING ${type.name} SUCCESS`, valueFormatted);
                    }
                    catch (e) {
                        this.log.error(`MIoT SETTING ERROR ${type.name}`, e);
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
                    this.log.debug(`MIIO START GETTING ${type.name}`, Date.now());
                    const property = await this.pullMIIOProperty();
                    const propertyFormatted = config.get.formatter(property);
                    callback(undefined, propertyFormatted);
                    this.log.debug(`MIIO GETTING ${type.name} SUCCESS`, propertyFormatted);
                }
                catch (e) {
                    this.log.error(`MIIO GETTING ${type.name} ERROR`, e);
                    callback(e);
                }
            });
        }
        if ('set' in config) {
            const set = config.set;
            if (set) {
                characteristic.on("set" /* SET */, async (value, callback) => {
                    try {
                        this.log.debug(`MIIO START SETTING ${type.name}`, Date.now());
                        const valueFormatted = set.formatter(value, this.MIIOPreviousProperties);
                        await this.setMIIOProperty(set.property, valueFormatted);
                        callback(undefined, value);
                        this.log.debug(`MIIO SETTING ${type.name} SUCCESS`, valueFormatted);
                    }
                    catch (e) {
                        this.log.error(`MIIO SETTING ${type.name} ERROR`, e);
                        callback(e);
                    }
                });
            }
        }
    }
}
exports.default = MIoTDevice;
//# sourceMappingURL=MIoTDevice.js.map