# flux-router-component

***Notice: This package will be deprecated in favor of [`fluxible-router`](https://github.com/yahoo/fluxible-router).***

[![npm version](https://badge.fury.io/js/flux-router-component.svg)](http://badge.fury.io/js/flux-router-component)
[![Build Status](https://travis-ci.org/yahoo/flux-router-component.svg?branch=master)](https://travis-ci.org/yahoo/flux-router-component)
[![Dependency Status](https://david-dm.org/yahoo/flux-router-component.svg)](https://david-dm.org/yahoo/flux-router-component)
[![devDependency Status](https://david-dm.org/yahoo/flux-router-component/dev-status.svg)](https://david-dm.org/yahoo/flux-router-component#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/yahoo/flux-router-component/badge.png?branch=master)](https://coveralls.io/r/yahoo/flux-router-component?branch=master)

Provides navigational React components (`NavLink`), router mixin (`RouterMixin`), and action `navigateAction` for applications built with [Flux](http://facebook.github.io/react/docs/flux-overview.html) architecture.  Please check out [examples](https://github.com/yahoo/flux-router-component/tree/master/examples) of how to use these components.

## Context and Expected Context Methods

Before we explain how to use `NavLink` and `RouterMixin`, lets start with two methods they expect:

* `executeAction(navigateAction, payload)` - This executes navigate action, switches the app to the new route, and update the url.
* `makePath(routeName, routeParams)` - This is used to generate url for a given route.

These two methods need to be available in:

* the React context of the component (access via `this.context` in the component), or
* the `context` prop of the component (`this.props.context`)
* If exists in both `this.context` and `this.props.context`, the one in `this.context` takes higher precedence.

An example of such context is the `ComponentContext` provided by [fluxible-plugin-routr](https://github.com/yahoo/fluxible-plugin-routr/blob/master/lib/routr-plugin.js#L36), which is a plugin for [fluxible](https://github.com/yahoo/fluxible).  We have a more sophisticated example application, [fluxible-router](https://github.com/yahoo/flux-examples/tree/master/fluxible-router), showing how everything works together.

**Note** that React context is an undocumented feature, so its API could change without notice.  Here is [a blog from Dave King](https://www.tildedave.com/2014/11/15/introduction-to-contexts-in-react-js.html) that explains what it is and how to use it.


## NavLink

[Docs](https://github.com/yahoo/flux-router-component/blob/master/docs/navlink.md)

## RouterMixin

[Docs](https://github.com/yahoo/flux-router-component/blob/master/docs/router-mixin.md)

## navigateAction

[Docs](https://github.com/yahoo/flux-router-component/blob/master/docs/navigateAction.md)


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

If you do decide to use hash route, it is recommended to enable `checkRouteOnPageLoad`.  Because hash fragment (that contains route) does not get sent to the server side, `RouterMixin` will compare the route info from server and route in the hash fragment.  On route mismatch, it will dispatch a navigate action on browser side to load the actual page content for the route represented by the hash fragment.

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
var RouterMixin = require('flux-router-component').RouterMixin;
var HistoryWithHash = require('flux-router-component/utils').HistoryWithHash;

var Application = React.createClass({
    mixins: [RouterMixin],
    ...
});

var appComponent = Application({
    ...
    historyCreator: function historyCreator() {
        return new HistoryWithHash({
            // optional. Defaults to true if browser does not support pushState; false otherwise.
            useHashRoute: true,
            // optional. Defaults to '/'. Used when url has no hash fragment
            defaultHashRoute: '/default',
            // optional. Transformer for custom hash route syntax
            hashRouteTransformer: {
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
* getUrl()
* getState()
* pushState(state, title, url)
* replaceState(state, title, url)

#### Example:

```js
var RouterMixin = require('flux-router-component').RouterMixin;
var MyHistory = require('MyHistoryManagerIsAwesome');

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

## Scroll Position Management

`RouterMixin` has a built-in mechanism for managing scroll position upon page navigation, for modern browsers that support native history state:

* reset scroll position to `(0, 0)` when user clicks on a link and navigates to a new page, and
* restore scroll position to last visited state when user clicks forward and back buttons to navigate between pages.

If you want to disable this behavior, you can set `enableScroll` prop to `false` for `RouterMixin`.  This is an example of how it can be done:

```js
var RouterMixin = require('flux-router-component').RouterMixin;

var Application = React.createClass({
    mixins: [RouterMixin],
    ...
});

var appComponent = Application({
    ...
    enableScroll: false
});

```

## onbeforeunload Support

The `History` API does not allow `popstate` events to be cancelled, which results in `window.onbeforeunload()` methods not being triggered.  This is problematic for users, since application state could be lost when they navigate to a certain page without knowing the consequences.

Our solution is to check for a `window.onbeforeunload()` method, prompt the user with `window.confirm()`, and then navigate to the correct route based on the confirmation.  If a route is cancelled by the user, we reset back to the original URL by using  the `History` `pushState()` method.

To implement the `window.onbeforeunload()` method, you need to set it within the components that need user verification before leaving a page.  Here is an example:

```javascript
componentDidMount: function() {
  window.onbeforeunload = function () {
    return 'Make sure to save your changes before leaving this page!';
  }
}
```


## Polyfills
`addEventListener` and `removeEventListener` polyfills are provided by:

* Compatibility code example on [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener)
* A few DOM polyfill libaries listed on [Modernizer Polyfill wiki page](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills#dom).

`Array.prototype.reduce` and `Array.prototype.map` (used by dependent library, query-string) polyfill examples are provided by:

* [Mozilla Developer Network Array.prototype.reduce polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Polyfill)
* [Mozilla Developer Network Array.prototype.map polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Polyfill)

You can also look into this [polyfill.io polyfill service](https://cdn.polyfill.io/v1/).

## Compatible React Versions

| Compatible React Version | flux-router-component Version |
|--------------------------|-------------------------------|
| 0.12 | >= 0.4.1 |
| 0.11 | < 0.4 |

## License
This software is free to use under the Yahoo! Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/flux-router-component/blob/master/LICENSE.md

Third-pary open source code used are listed in our [package.json file]( https://github.com/yahoo/flux-router-component/blob/master/package.json).

