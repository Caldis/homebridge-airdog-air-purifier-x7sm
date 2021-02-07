"use strict";
const AirDogAirPurifierX7SM_1 = require("./AirDogAirPurifierX7SM");
const homebridge_miot_devices_1 = require("homebridge-miot-devices");
const PLATFORM_NAME = 'AirDogAirPurifierX7SM';
class Platform {
    constructor(logging, platformConfig, api) {
        // Foundation
        homebridge_miot_devices_1.SharedFoundation.hap = api.hap;
        homebridge_miot_devices_1.SharedFoundation.log = logging;
        // Config
        this.devices = platformConfig.devices;
    }
    /*
     * This method is called to retrieve all accessories exposed by the platform.
     * The Platform can delay the response my invoking the callback at a later time,
     * it will delay the bridge startup though, so keep it to a minimum.
     * The set of exposed accessories CANNOT change over the lifetime of the plugin!
     */
    accessories(callback) {
        callback(this.devices.reduce((acc, identify) => acc.concat(new AirDogAirPurifierX7SM_1.AirDogAirPurifierX7SM({ identify })), []));
        homebridge_miot_devices_1.SharedFoundation.log.info(`${PLATFORM_NAME} platform is initialized`);
    }
}
module.exports = (api) => {
    api.registerPlatform(PLATFORM_NAME, Platform);
};
