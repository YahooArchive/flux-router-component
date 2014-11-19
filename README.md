# fluxible-router 
[![Build Status](https://travis-ci.org/yahoo/fluxible-router.svg?branch=master)](https://travis-ci.org/yahoo/fluxible-router) [![Dependency Status](https://david-dm.org/yahoo/fluxible-router.svg)](https://david-dm.org/yahoo/fluxible-router) [![Coverage Status](https://coveralls.io/repos/yahoo/fluxible-router/badge.png?branch=master)](https://coveralls.io/r/yahoo/fluxible-router?branch=master)
This package provides navigational React components and router React mixin for applications built with [Flux](http://facebook.github.io/react/docs/flux-overview.html) architecture.  Please check out [examples](https://github.com/yahoo/fluxible-router/tree/master/examples) of how to use these components.

## Fluxible Plugin

For use with [fluxible-app](https://github.com/yahoo/fluxible-app):

```js
var FluxibleApp = require('fluxible-app');
var routerPlugin = require('fluxible-router').plugin;
var app = new FluxibleApp();

var pluginInstance = routerPlugin({
    routes: {
        user: {
            path: '/user/:id',
            method: 'get',
            // the navigate action will execute this action when the route is matched
            action: function (actionContext, payload, done) {
                // ...
                done();
            }
        }
    }
});

app.plug(pluginInstance);
```

Adds the following methods to your fluxible contexts:

 * `actionContext.router.makePath(routeName, routeParams)`: Create a URL based on route name and params
 * `actionContext.router.getRoute(path)`: Returns matched route
 * `componentContext.makePath(routeName, routeParams)`: Create a URL based on route name and params

## NavLink Component

`NavLink` is the a React component for navigational links.  When the link is clicked, NavLink will dispatch `NAVIGATE` action to flux dispatcher.  The dispatcher can then dispatch the action to the stores that can handle it.

Example of using `NavLink` with `href` property defined:

```js
var NavLink = require('fluxible-router').NavLink;

var Nav = React.createClass({
    render: function () {
        var pages,
            links,
            context = this.props.context;  // this should have a router instance and an executeAction function
        pages = [
            {
                name: 'home',
                url: '/home',
                text: 'Home'
            },
            {
                name: 'about',
                url: '/about',
                text: 'About Us'
            }
        ];
        links = pages.map(function (page) {
            return (
                <li className="navItem">
                    <NavLink href={page.url} context={context}>
                        {page.text}
                    </NavLink>
                </li>
            );
        });
        return (
            <ul className="nav">
                {links}
            </ul>
        );

    }
});
```

We also have another more sophisticated example application, [routing](https://github.com/yahoo/flux-examples/tree/master/routing), that uses `NavLink` with `routeName` property defined.

## RouterMixin

`RouterMixin` is a React mixin to be used by application's top level React component to:

* [manage browser history](#history-management-browser-support-and-hash-based-routing) when route changes, and
* execute navigate action and then dispatch `CHANGE_ROUTE_START` and `CHANGE_ROUTE_SUCCESS` or `CHANGE_ROUTE_FAILURE` events via flux dispatcher on window `popstate` events


### Example Usage
```js
var RouterMixin = require('fluxible-router').RouterMixin;

var Application = React.createClass({
    mixins: [RouterMixin],
    ...
});
```

## History Management (Browser Support and Hash-Based Routing)
Considering different application needs and [different browser support levels for pushState](http://caniuse.com/#search=pushstate), this library provides the following options for browser history management:

* Use `History` provided by this library (Default)
* Use `HistoryWithHash` provided by this library
* In addition, you can also customize it to use your own

### History
This is the default `History` implementation `RouterMixin` uses.  It is a straight-forward implementation that:
* uses `pushState`/`replaceState` when they are available in the browser.
* For the browsers without pushState support, `History` simply refreshes the page by setting `window.location.href = url` for `pushState`, and calling `window.location.replace(url)` for `replaceState`.

### HistoryWithHash
Using hash-based url for client side routing has a lot of known issues.  [History.js describes those issues pretty well](https://github.com/browserstate/history.js/wiki/Intelligent-State-Handling).

But as always, there will be some applications out there that have to use it.  This implementation provides a solution.

#### useHashRoute Config
You can decide when to use hash-based routing through the `useHashRoute` option:

* `useHashRoute=true` to force to use hash routing for all browsers, by setting `useHashRoute` to true when creating the `HistoryWithHash` instance;
* `unspecified`, i.e. omitting the setting, to only use hash route for browsers without native pushState support;
* `useHashRoute=false` to turn off hash routing for all browsers.

|  | useHashRoute = true | useHashRoute = false | useHashRoute unspecified |
|--------------------------------------|-------------------------------------------------|---------------------------------------|--------------------------------|
| Browsers *with* pushState support | history.pushState with /home#/path/to/pageB | history.pushState with /path/to/pageB | Same as `useHashRoute = false` |
| Browsers *without* pushState support | page refresh to /home#/path/to/pageB | page refresh to /path/to/pageB | Same as `useHashRoute = true` |

#### Custom Transformer for Hash Fragment
By default, the hash fragments are just url paths.  With `HistoryWithHash`, you can transform it to whatever syntax you need by passing `props.hashRouteTransformer` to the base React component that `RouterMixin` is mixed into.  See the example below for how to configure it.

#### Example
This is an example of how you can use and configure `HistoryWithHash`:

```js
var RouterMixin = require('flux-router-component').RouterMixin,
    HistoryWithHash = require('flux-router-component/utils').HistoryWithHash;

var Application = React.createClass({
    mixins: [RouterMixin],
    ...
});

var appComponent = Application({
    ...
    historyCreator: function historyCreator() {
        return new HistoryWithHash({
            useHashRoute: true, // optional
            hashRouteTransformer: {  // optional transformer for custom hash route syntax
                transform: function (original) {
                    // transform url hash fragment from '/new/path' to 'new-path'
                    var transformed = original.replace('/', '-').replace(/^(\-+)/, '');
                    return transformed;
                },
                reverse: function (transformed) {
                    // reverse transform from 'new-path' to '/new/path'
                    var original = '/' + (transformed && transformed.replace('-', '/'));
                    return original;
                }
            }
        });
    }
});

```

### Provide Your Own History Manager
If none of the history managers provided in this library works for your application, you can also customize the RouterMixin to use your own history manager implementation.  Please follow the same API as `History`.

#### API
Please use `History.js` and `HistoryWithHash.js` as examples.

* on(listener)
* off(listener)
* getPath()
* pushState(state, title, url)
* replaceState(state, title, url)

#### Example:

```js
var RouterMixin = require('flux-router-component').RouterMixin,
    MyHistory = require('MyHistoryManagerIsAwesome');

var Application = React.createClass({
    mixins: [RouterMixin],
    ...
});

var appComponent = Application({
    ...
    historyCreator: function historyCreator() {
        return new MyHistory();
    }
});

```


## Polyfills
`addEventListener` and `removeEventListener` polyfills are provided by:

* Compatibility code example on [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener)
* A few DOM polyfill libaries listed on [Modernizer Polyfill wiki page](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills#dom).

`Array.prototype.reduce` and `Array.prototype.map` (used by dependent library, query-string) polyfill examples are provided by:

* [Mozilla Developer Network Array.prototype.reduce polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Polyfill)
* [Mozilla Developer Network Array.prototype.map polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Polyfill)

You can also look into this [polyfill.io polyfill service](https://cdn.polyfill.io/v1/).

## License
This software is free to use under the Yahoo! Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/fluxible-router/blob/master/LICENSE.md

Third-pary open source code used are listed in our [package.json file]( https://github.com/yahoo/fluxible-router/blob/master/package.json).

