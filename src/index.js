const _ = require('underscore');
const Di = require('./di');

module.exports = {
    create: create,
    service: service
};


// FUNCTIONS:

function create() {
    return new Di();
}

/**
 * Register Service...
 * @param {Array|Object} injectOptions
 * @returns {Function}
 */
function service(injectOptions) {
    return register('service', createServiceId(), injectOptions);
}

/**
 * Register Factory...
 * @param {Array|Object} injectOptions
 * @returns {Function}
 */
function factory(injectOptions) {
    return register('factory', createFactoryId(), injectOptions);
}

/**
 * Register Service or Factory...
 * @param {String} behavior
 * @param {String} id
 * @param {Array|Object} injectOptions
 * @returns {Function}
 */
function register(behavior, id, injectOptions) {
    const opt = performInjectOptions(injectOptions);
    const err = validateInjectWay(opt);
    if (err) {
        return console.error(`[jslang-injector] ${err}`);
    }
    return function resolver() {
        return this.__resolve(behavior, id, opt);
    };
}

/**
 * Prepare inject options...
 * @param {*} injectOptions
 * @returns {Array}
 */
function performInjectOptions(injectOptions) {
    let opt;
    if (_.isArray(injectOptions)) {
        opt = injectOptions;
    } else if (_.has(injectOptions, '__injectOptions')) { // `injectOptions` is a service reference in this case...
        /*
         * Could be a string: Http.__injectOptions = 'asClass';
         * or a short array:  Http.__injectOptions = ['asFunction'];
         * or a full array:   Http.__injectOptions = ['asFunction', Http];
         */
        opt = injectOptions['__injectOptions'];
        if (_.isString(opt)) {
            opt = [opt, injectOptions];
        } else if (_.isArray(opt)) {
            if (opt.length === 1) {
                opt.push(injectOptions);
            }
        } else {
            return console.error(`[jslang-injector] Invalid service '__injectOptions' type: '${typeof opt}'!`);
        }
    } else {
        return console.error(`[jslang-injector] Invalid mandatory 'injectOptions' argument!`);
    }
    return opt;
}

/**
 * @param {Array} injectOptions
 * @returns {null|String}
 */
function validateInjectWay(injectOptions) {
    const injectWay = injectOptions.length > 0 ? injectOptions[0] : undefined;
    if (!_.isString(injectWay)) {
        return `'injectOptions[0]' must be a string, '${typeof injectWay}' given!`;
    }
    if (['asClass', 'asFunction', 'asProvider'].indexOf(injectWay) < 0) {
        return `Invalid 'injectOptions[0]' value: '${injectWay}'!`;
    }
    if (injectWay === 'asProvider') {
        const provider = injectOptions.length > 1 ? injectOptions[1] : undefined;
        if (!_.isFunction(provider)) {
            return `'injectOptions[1]' must be a function: '${typeof provider}' given!`;
        }
    } else { // 'asClass' or 'asFunction'...
        const serviceRef = injectOptions.length > 1 ? injectOptions[1] : undefined;
        if (!_.isFunction(serviceRef) && !_.isObject(serviceRef)) {
            return `Invalid 'injectOptions[1]' type: '${typeof serviceRef}'!`;
        }
    }
    return null;
}

/**
 * @returns {String}
 */
function createServiceId() {
    return _.uniqueId('service');
}

/**
 * @returns {String}
 */
function createFactoryId() {
    return _.uniqueId('factory');
}
