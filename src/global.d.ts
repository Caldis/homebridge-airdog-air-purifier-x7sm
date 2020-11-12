declare module 'miio' {
  type Spec = { name: string; siid: number, piid: number }
  type Specs = Spec[]
  type SpecMapping = { [name: string]: Spec }
  type SpecGetQuery = Spec & { did: string }
  type SpecsGetQuery = SpecGetQuery[]
  type SpecSetQuery = Spec & { did: string; value: any }
  type SpecsSetQuery = SpecSetQuery[]
  type SpecsResponse<T> = Spec & { did: string; value: T }
  type SpecsResponseMapping = { [name: string]: SpecsResponse<any> }
  type SpecsResponseValueMapping = { [name: string]: any }

  export type DeviceConfig = { name: string; address: string; token: string; }
  export type DeviceConfigs = DeviceConfig[]

  class DeviceInstance {
    public id: string
    public did: string
    public timeout: number

    public miioCall<T extends any> (action: 'get_properties', specQuery: SpecsGetQuery): SpecsResponse<T>[]
    public miioCall<T extends any> (action: 'get_prop', specQuery: SpecsGetQuery): SpecsResponse<T>[]
    public miioCall<T extends any> (action: 'set_properties', specQuery: SpecsSetQuery): SpecsResponse<T>[]
    public miioCall<T extends any> (action: 'set_prop', specQuery: SpecsSetQuery): SpecsResponse<T>[]
  }

  class miio {
    static device: (args: { address: string; token: string }) => Promise<DeviceInstance>
  }

  export { Spec, Specs, SpecMapping, SpecGetQuery, SpecsGetQuery, SpecSetQuery, SpecsSetQuery, SpecsResponse, SpecsResponseMapping, SpecsResponseValueMapping, DeviceInstance }
  export default miio
}
