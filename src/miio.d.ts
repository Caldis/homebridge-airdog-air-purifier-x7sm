declare module 'miio' {
  export default class miio {
    static device: (args: { address: string; token: string }) => Promise<DeviceInstance>
  }
}
