# Fluxible Router

[![npm version](https://img.shields.io/npm/v/fluxible-router.svg?style=flat-square)](https://www.npmjs.com/package/fluxible-router)
[![Build Status](https://img.shields.io/travis/yahoo/fluxible-router.svg?style=flat-square)](https://travis-ci.org/yahoo/fluxible-router)
[![Coverage Status](https://img.shields.io/coveralls/yahoo/fluxible-router.svg?style=flat-square)](https://coveralls.io/r/yahoo/fluxible-router?branch=master)
[![Dependency Status](https://img.shields.io/david/yahoo/fluxible-router.svg?style=flat-square)](https://david-dm.org/yahoo/fluxible-router)
[![devDependency Status](https://img.shields.io/david/dev/yahoo/fluxible-router.svg?style=flat-square)](https://david-dm.org/yahoo/fluxible-router#info=devDependencies)

Isomorphic Flux routing for applications built with [Fluxible](https://github.com/yahoo/fluxible).

```bash
$ npm install --save fluxible-router
```

[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/yahoo/fluxible)

## Docs

 * [Quick Start](https://github.com/yahoo/fluxible-router/blob/master/docs/quick-start.md)
 * [API](https://github.com/yahoo/fluxible-router/blob/master/docs/api/README.md)

## Features

 * Isomorphic routing
 * Follows Flux flow
 * Higher order components for handling [history](https://github.com/yahoo/fluxible-router/blob/master/docs/api/handleHistory.md) and [routes](https://github.com/yahoo/fluxible-router/blob/master/docs/api/handleRoute.md)
 * [`navigateAction`](https://github.com/yahoo/fluxible-router/blob/master/docs/api/navigateAction.md) for changing routes
 * Updated for React 0.13

## Usage

```js
var Fluxible = require('fluxible');
var Router = require('fluxible-router');
var React = require('react');

// Component
var App = React.createClass({
    mixins: [Fluxible.FluxibleMixin], // Calls onChange when storeListeners emit change
    statics: {
        storeListeners: [Store]
    },
    getInitialState: function () {
        return this.getStore(Store).getState();
    },
    onChange: function () {
        this.setState(this.getStore(Store).getState());
    },
    render: function () {
        return <span>{this.state.foo}</span>
    }
});

// App
var fluxibleApp = new Fluxible({
    component: App
});
fluxibleApp.registerStore(Store);

// Bootstrap
var context = fluxibleApp.createContext();
context.executeAction(action, 'bar', function () {
    console.log(React.renderToString(context.createElement()));
});
```

## Required Polyfills

`addEventListener` and `removeEventListener` polyfills are provided by:

* Compatibility code example on [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener)
* A few DOM polyfill libaries listed on [Modernizer Polyfill wiki page](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills#dom).

`Array.prototype.reduce` and `Array.prototype.map` (used by dependent library, query-string) polyfill examples are provided by:

* [Mozilla Developer Network Array.prototype.reduce polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Polyfill)
* [Mozilla Developer Network Array.prototype.map polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Polyfill)

You can also look into this [polyfill.io polyfill service](https://cdn.polyfill.io/v1/).

## Compatible React Versions

| Compatible React Version | fluxible-router Version |
|--------------------------|-------------------------------|
| 0.13 | >= 1.x |

## License
This software is free to use under the Yahoo Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/fluxible-router/blob/master/LICENSE.md

Third-party open source code used are listed in our [package.json file]( https://github.com/yahoo/fluxible-router/blob/master/package.json).
