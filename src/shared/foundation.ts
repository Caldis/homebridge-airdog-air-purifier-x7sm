import { HAP, Logging } from 'homebridge'

class Foundation {
  public log!: Logging
  public hap!: HAP
}

export const SharedFoundation = new Foundation()
