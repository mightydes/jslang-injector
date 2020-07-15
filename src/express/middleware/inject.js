const injector = require('../../index');

module.exports = inject;

function inject(injectList) {
    return (req, res, next) => {
        if (!('di' in req)) {
            req.di = injector.create();
        }
        try {
            injectList.map((serviceKey) => {
                if (!(serviceKey in req.di)) {
                    inject.bindHandler(req, serviceKey);
                }
            });
        } catch (e) {
            return next(e);
        }
        return next();
    };
}

inject.bindHandler = (req, serviceKey) => {
    throw new Error(`[jslang-injector][inject.bindHandler] Invalid service key: '${serviceKey}'!`);
};
