# jslang-injector

Simple JavaScript service injector for Browser or Node.
Depends only on `underscore`.
Compatible with IE 9 (no proxies).

---
## Usage

```js
const injector = require('jslang-injector');

// Define cache service:
function cacheService() {
    return {
        // ...
    };
}

// Define product service:
class ProductService {
    // ...
}

// Define pizza service:
class PizzaService {

    constructor(cacheService, productService) {
        // ...
    }

}
// Set inject options as static property:
PizzaService.__injectOptions = ['asProvider', (di) => new PizzaService(di.cacheService(), di.productService())];

// Define cheese pizza service:
class CheesePizzaService {

    constructor(pizzaService) {
        // ...
    }
    
    bake() {
        // ...
    }

}

let di = injector.create();

// Register cache service:
di.cacheService = injector.service(['asFunction', cacheService]);

// Register product service:
di.productService = injector.service(['asClass', ProductService]);

// Register pizza service:
di.pizzaService = injector.service(PizzaService); // inject options defined in static property `__injectOptions`

// Register cheese pizza service:
di.cheesePizzaService = injector.service(['asProvider', (di) => new CheesePizzaService(di.pizzaService())]);

return di.cheesePizzaService().bake();

```

---
## Quick Guide

This simple package provides two resolve behaviors and four ways to define resolver.

### Ways to define resolver

1.  Via function call:

    ```js
    function cacheService() {
        return {
            // ...
        };
    }

    di.cacheService = injector.service(['asFunction', cacheService]);
    ```

    In this way `di.cacheService()` returns resolved instance of `cacheService()` call.

1.  Via class builder:

    ```js
    class ProductService {
        // ...
    }

    di.productService = injector.service(['asClass', ProductService]);
    ```

    In this way `di.productService()` returns resolved instance of `new ProductService()` call.

1.  Via provider function:

    ```js
    function namesService() {
        return {
            // ...
        };
    }

    di.namesService = injector.service(['asProvider', (di) => {

        // Any configuration here...
        const options = {};

        return namesService(di.cacheService(), options);
    }]);
    ```

    In this way `di.namesService()` returns resolved instance of user defined provider function call.

1.  Via static property:

    ```js
    class PizzaService {
    }
    PizzaService.__injectOptions = ['asProvider', (di) => new PizzaService(di.cacheService(), di.productService())];

    di.pizzaService = injector.service(PizzaService);
    ```

    In this way `di.pizzaService()` returns resolved instance of `PizzaService.__injectOptions` instructions.

    Static `injectOptions` could be:
    1.  A string: `PizzaService.__injectOptions = 'asClass';`.
    1.  A short array: `PizzaService.__injectOptions = ['asClass'];`.
    1.  A full array: `PizzaService.__injectOptions = ['asClass', PizzaService];`.

### Resolve behaviors

1.  As service (`injector.service(['asFunction', cacheService])`) -- would be resolved once and cached for later usage.

1.  As factory (`injector.factory(['asFunction', cacheService])`) -- would be resolved on every `di.cacheService()` call.

---
## ExpressJS middleware

Sample usage with [express](http://expressjs.com/) framework.
In this case used middleware to bind `req.di` object.

```js
const express = require('express');
const injector = require('jslang-injector');
const inject = require('jslang-injector/express/middleware/inject');

const CacheService = require('./path/to/cache-service');
const PizzaService = require('./path/to/pizza-service');

// Define available services bind handler:
inject.bindHandler = (req, serviceKey) => {
    switch (serviceKey) {
        case 'cache':
            req.di.cache = injector.service(CacheService);
            break;
        case 'pizza':
            req.di.pizza = injector.service(PizzaService);
            break;
        default:
            throw new Error(`Invalid service key: '${serviceKey}'!`);
    }
};


const app = express();

app.use('/hello-pizza', inject(['cache', 'pizza']), (req, res) => {
//                      ^ 'inject.bindHandler' will be called here

    // Now we can use services:
    let pizza = req.di.cache().get('pizza');
    if (!pizza) {
        pizza = req.di.pizza().bake();
    }
    return res.send(pizza.toHtml());
});

```
