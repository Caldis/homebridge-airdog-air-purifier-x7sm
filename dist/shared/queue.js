"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedQueue = void 0;
class Queue {
    constructor() {
        this.queue = {};
    }
    append(identify, resolver) {
        if (!Array.isArray(this.queue[identify.address])) {
            this.queue[identify.address] = [];
        }
        this.queue[identify.address].push(resolver);
    }
    resolve(identify, value) {
        const currentQueue = this.queue[identify.address];
        this.queue[identify.address] = [];
        currentQueue.forEach(resolve => resolve(value));
    }
}
exports.SharedQueue = new Queue();
//# sourceMappingURL=queue.js.map