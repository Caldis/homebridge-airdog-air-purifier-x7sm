"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedDevice = void 0;
const miio_1 = __importDefault(require("miio"));
const lodash_debounce_1 = __importDefault(require("lodash.debounce"));
const queue_1 = require("./queue");
const foundation_1 = require("./foundation");
const MIoTDevice_utils_1 = require("../MIoTDevice.utils");
const RE_CONNECT_THRESHOLD = 90000;
const RE_CONNECT_FAILURE_THRESHOLD = 10000;
const REQUEST_CONNECT_DEBOUNCE_THRESHOLD = 100;
class Device {
    constructor() {
        this.device = {};
        this.isConnected = (identify) => {
            const deviceInstance = this.device[identify.address];
            if (!deviceInstance)
                return false;
            const now = Date.now();
            const diff = now - deviceInstance.timeout;
            deviceInstance.timeout = now;
            return diff < RE_CONNECT_THRESHOLD;
        };
        this.requestConnect = async (identify) => {
            // Do connect
            try {
                // Log
                foundation_1.SharedFoundation.log.info(`${identify.name} ${identify.address} start ${!!this.device[identify.address] ? 're-' : ''}connecting.`);
                // Create device instance
                const device = await miio_1.default.device({ address: identify.address, token: identify.token });
                device.did = MIoTDevice_utils_1.getDeviceId(device.id);
                device.timeout = Date.now();
                // Update
                this.device[identify.address] = device;
                // Resolve queues
                queue_1.SharedQueue.resolve(identify, device);
                // Log
                foundation_1.SharedFoundation.log.info(`${identify.name} ${identify.address} connected.`);
            }
            catch (e) {
                // Retry if failure
                if (this.isConnected(identify))
                    return;
                foundation_1.SharedFoundation.log.info(`${identify.name} ${identify.address} connect failure, reconnecting ...`, e);
                await MIoTDevice_utils_1.sleep(RE_CONNECT_FAILURE_THRESHOLD);
                await this.requestConnect(identify);
            }
        };
        this.debounceRequestConnect = lodash_debounce_1.default(this.requestConnect, REQUEST_CONNECT_DEBOUNCE_THRESHOLD);
    }
    getInstance(identify) {
        // return this.device[identify]
        return new Promise(resolve => {
            // Queue update
            queue_1.SharedQueue.append(identify, resolve);
            // Trigger getter
            this.debounceRequestConnect(identify);
        });
    }
}
exports.SharedDevice = new Device();
//# sourceMappingURL=device.js.map