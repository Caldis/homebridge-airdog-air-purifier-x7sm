"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.getDeviceId = void 0;
const getDeviceId = (id) => {
    return id.replace(/miio:/, '');
};
exports.getDeviceId = getDeviceId;
const sleep = (delay) => {
    return new Promise((resolve) => setTimeout(resolve, delay));
};
exports.sleep = sleep;
//# sourceMappingURL=MIoTDevice.utils.js.map