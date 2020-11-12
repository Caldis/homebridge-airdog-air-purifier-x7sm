declare module 'miio' {
  type MIOTSpec = { name: string; siid: number, piid: number }
  type MIOTSpecs = MIOTSpec[]
  type MIOTSpecMapping = { [name: string]: MIOTSpec }
  type MIOTSpecGetQuery = MIOTSpec & { did: string }
  type MIOTSpecsGetQuery = MIOTSpecGetQuery[]
  type MIOTSpecSetQuery = MIOTSpec & { did: string; value: any }
  type MIOTSpecsSetQuery = MIOTSpecSetQuery[]
  type MIOTSpecsResponse<T> = MIOTSpec & { did: string; value: T }
  type MIOTSpecsResponseMapping = { [name: string]: MIOTSpecsResponse<any> }
  type MIOTSpecsResponseValueMapping = { [name: string]: any }

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
    public miioCall<T extends any> (action: 'get_properties', specQuery: MIOTSpecsGetQuery): MIOTSpecsResponse<T>[]
    public miioCall<T extends any> (action: 'set_properties', specQuery: MIOTSpecsSetQuery): MIOTSpecsResponse<T>[]
    // MIIO
    public miioCall<T extends any> (action: 'get_prop', specQuery: MIIOSpecGetQuery): MIIOSpecResponse
    public miioCall<T extends any> (action: string, specQuery: (string | number)[]): any
  }

  class miio {
    static device: (args: { address: string; token: string }) => Promise<DeviceInstance>
  }

  export {
    MIOTSpec,
    MIOTSpecs,
    MIOTSpecMapping,
    MIOTSpecGetQuery,
    MIOTSpecsGetQuery,
    MIOTSpecSetQuery,
    MIOTSpecsSetQuery,
    MIOTSpecsResponse,
    MIOTSpecsResponseMapping,
    MIOTSpecsResponseValueMapping,
    MIIOSpec,
    MIIOSpecMapping,
    MIIOSpecGetQuery,
    MIIOSpecResponse,
    MIIOSpecResponseValueMapping,
    DeviceInstance
  }
  export default miio
}
