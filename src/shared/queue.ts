type Resolver = (...args: any[]) => void

class Queue {

  private queue: { [address: string]: Resolver[] } = {}

  public append(identify: MIoTDeviceIdentify, resolver: Resolver) {
    if (!Array.isArray(this.queue[identify.address])) {
      this.queue[identify.address] = []
    }
    this.queue[identify.address].push(resolver)
  }
  public resolve(identify: MIoTDeviceIdentify, value: any) {
    const currentQueue = this.queue[identify.address]
    this.queue[identify.address] = []
    currentQueue.forEach(resolve => resolve(value))
  }

}

export const SharedQueue = new Queue()
