"use strict";
const AirDogAirPurifierX7SM_1 = require("./devices/AirDogAirPurifierX7SM");
const foundation_1 = require("./shared/foundation");
const PLATFORM_NAME = 'AirDogAirPurifierX7SM';
class Platform {
    constructor(logging, platformConfig, api) {
        // Foundation
        foundation_1.SharedFoundation.hap = api.hap;
        foundation_1.SharedFoundation.log = logging;
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
        foundation_1.SharedFoundation.log.info(`${PLATFORM_NAME} platform is initialized`);
    }
}
module.exports = (api) => {
    api.registerPlatform(PLATFORM_NAME, Platform);
};
//# sourceMappingURL=index.js.map