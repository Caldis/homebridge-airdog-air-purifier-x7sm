import { AirDogAirPurifierX7SM } from './devices/AirDogAirPurifierX7SM'
import { AccessoryPlugin, API, Logging, PlatformConfig, StaticPlatformPlugin, } from 'homebridge'
import { SharedFoundation } from './shared/foundation'

const PLATFORM_NAME = 'AirDogAirPurifierX7SM'

export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, Platform)
}

class Platform implements StaticPlatformPlugin {

  private readonly devices: DeviceConfigs

  constructor (logging: Logging, platformConfig: PlatformConfig, api: API) {
    // Foundation
    SharedFoundation.hap = api.hap
    SharedFoundation.log = logging
    // Config
    this.devices = platformConfig.devices
  }

  /*
   * This method is called to retrieve all accessories exposed by the platform.
   * The Platform can delay the response my invoking the callback at a later time,
   * it will delay the bridge startup though, so keep it to a minimum.
   * The set of exposed accessories CANNOT change over the lifetime of the plugin!
   */
  accessories (callback: (foundAccessories: AccessoryPlugin[]) => void): void {
    callback(this.devices.reduce((acc, identify) =>
      acc.concat(new AirDogAirPurifierX7SM({ identify })), [] as AccessoryPlugin[])
    )
    SharedFoundation.log.info(`${PLATFORM_NAME} platform is initialized`)
  }
}
