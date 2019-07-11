const _ = require('underscore');

class Di {

    constructor() {
        this.__stack = [];
        this.__cache = {};
    }

    __resolve(behavior, id, injectOptions) {
        let flushStack = null;
        if (this.__stack.length === 0) { // ie first resolver...
            flushStack = () => this.__stack = [];
            this.__stack.push(id);
        } else {
            // Check cycling:
            if (this.__stack.indexOf(id) > -1) {
                return console.error(`[jslang-injector] Detected cycling during injecting!`);
            }
            this.__stack.push(id);
        }

        // Resolve:
        let out;
        if (behavior === 'service') {
            if (!_.has(this.__cache, id)) {
                this.__cache[id] = getProvider(injectOptions)(this);
            }
            out = this.__cache[id];
        } else { // factory...
            out = getProvider(injectOptions)(this);
        }

        if (flushStack) {
            flushStack();
        }

        return out;
    }

}

module.exports = Di;


// FUNCTIONS:

/**
 * @param {Array} injectOptions
 * @returns {Function}
 */
function getProvider(injectOptions) {
    const injectWay = injectOptions[0];
    if (injectWay === 'asProvider') {
        return injectOptions[1];
    }
    if (injectWay === 'asClass') {
        return () => new injectOptions[1]();
    }
    // `asFunction`:
    return () => injectOptions[1]();
}
