export {}

declare global {
  type MIoTSpec = { name: string; siid: number, piid: number }
  type MIoTSpecs = MIoTSpec[]
  type MIoTSpecMapping = { [name: string]: MIoTSpec }
  type MIoTSpecGetQuery = MIoTSpec & { did: string }
  type MIoTSpecsGetQuery = MIoTSpecGetQuery[]
  type MIoTSpecSetQuery = MIoTSpec & { did: string; value: any }
  type MIoTSpecsSetQuery = MIoTSpecSetQuery[]
  type MIoTSpecsResponse<T> = MIoTSpec & { did: string; value: T }
  type MIoTSpecsResponseMapping = { [name: string]: MIoTSpecsResponse<any> }
  type MIoTSpecsResponseValueMapping = { [name: string]: any }
  type MIoTDeviceIdentify = { name: string; token: string; address: string; }

  type MIIOSpec = string
  type MIIOSpecMapping = { [name: string]: MIIOSpec }
  type MIIOSpecGetQuery = MIIOSpec[]
  type MIIOSpecResponse = (string | number)[]
  type MIIOSpecResponseValueMapping = { [name: string]: any }

  export type DeviceConfig = { name: string; address: string; token: string; }
  export type DeviceConfigs = DeviceConfig[]

  class DeviceInstance {
    public id: string
    public did: string
    public timeout: number

    // MIoT
    public miioCall<T extends any> (action: 'get_properties', specQuery: MIoTSpecsGetQuery): MIoTSpecsResponse<T>[]
    public miioCall<T extends any> (action: 'set_properties', specQuery: MIoTSpecsSetQuery): MIoTSpecsResponse<T>[]
    // MIIO
    public miioCall<T extends any> (action: 'get_prop', specQuery: MIIOSpecGetQuery): MIIOSpecResponse
    public miioCall<T extends any> (action: string, specQuery: (string | number)[]): any
  }
}
