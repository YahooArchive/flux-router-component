# flux-router-component 

[![npm version](https://badge.fury.io/js/flux-router-component.svg)](http://badge.fury.io/js/flux-router-component)
[![Build Status](https://travis-ci.org/yahoo/flux-router-component.svg?branch=master)](https://travis-ci.org/yahoo/flux-router-component)
[![Dependency Status](https://david-dm.org/yahoo/flux-router-component.svg)](https://david-dm.org/yahoo/flux-router-component)
[![devDependency Status](https://david-dm.org/yahoo/flux-router-component/dev-status.svg)](https://david-dm.org/yahoo/flux-router-component#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/yahoo/flux-router-component/badge.png?branch=master)](https://coveralls.io/r/yahoo/flux-router-component?branch=master)

Provides navigational React components and router mixin for applications built with [Flux](http://facebook.github.io/react/docs/flux-overview.html) architecture.  Please check out [examples](https://github.com/yahoo/flux-router-component/tree/master/examples) of how to use these components.

## NavLink
`NavLink` is the a React component for navigational links.  When the link is clicked, NavLink will dispatch `NAVIGATE` action to flux dispatcher.  The dispatcher can then dispatch the action to the stores that can handle it.

### Example Usage

Here are two examples of generating `NavLink` using `href` property, and using `routeName` property.  Using `href` property is better than using `routeName`, because:

* Using `href` makes your code more readible, as it shows exactly how the `href` is generated.
* Using `routeName` assumes `this.prop.context` has a `makePath()` function, which will be used to generate the `href` from the `routeName` and `navParams` props.
* Using `routeName` could be more limited, especially when it comes to query string and hash fragment, if the `makePath()` function does not support query string and hash fragment.

#### Example of Using `href` Property (Recommended)

If the url is static, or you can generate the url outside of `Navlink`, you can simply pass the url to `NavLink` as a prop.  Here is an example:

```js
var NavLink = require('flux-router-component').NavLink;

var Nav = React.createClass({
    render: function () {
        var pages,
            links,
            context = this.props.context;  // context should provide executeAction()
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

#### Example of Using `routeName` Property

Before you continue with this example, you should know that you can always generate the url yourself outside of `NavLink` and pass it to `NavLink` as `href` prop just like the example above.  Your code will be more straight-forward that way, and you will have more control over how to generate `href` (see more explanations in [the Example Usage section](#example-usage)).

If you choose not to generate `href` yourself and the `context` prop you pass to `NavLink` provides `makePath(routeName, routeParams)`, you can also use the `routeName` prop (and the optional `navParams` prop).  If the `href` prop is not present, `NavLink` will use `this.props.context.makePath(this.props.routeName, this.props.navParams)` to generate the `href` for the anchor element. The `navParams` prop is useful for dynamic routes.  It should be a hash object containing the route parameters and their values.

An example of such context is the `ComponentContext` provided by [fluxible-plugin-routr](https://github.com/yahoo/fluxible-plugin-routr/blob/master/lib/routr-plugin.js#L36), which is a plugin for [fluxible-app](https://github.com/yahoo/fluxible-app).  We have a more sophisticated example application, [routing](https://github.com/yahoo/flux-examples/tree/master/routing), showing how everything works together.

Here is a quick example code showcasing how to use `routeName` prop along with `navParams` prop:

```js
// assume routes are defined somewhere like this:
// var routes = {
//     home: {
//         path: '/',
//         page: 'home'
//     },
//     article: {
//         path: '/article/:id',
//         page: 'article'
//     }
// };
var pages = [
    {
        routeName: 'home',
        text: 'Home'
    },
    {
        routeName: 'article',
        routeParams: {
            id: 'a'
        }
        text: 'Article A'
    },
    {
        routeName: 'article',
        routeParams: {
            id: 'b'
        }
        text: 'Article B'
    }
];
var Nav = React.createClass({
    render: function () {
        var context = this.props.context;  // context should provide executeAction() and makePath()
        var links = pages.map(function (page) {
            return (
                <li className="navItem">
                    <NavLink routeName={page.routeName} navParams={page.routeParams} context={context}>
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


## RouterMixin
`RouterMixin` is a React mixin to be used by application's top level React component to:

* [manage browser history](#history-management-browser-support-and-hash-based-routing) when route changes, and
* execute navigate action and then dispatch `CHANGE_ROUTE_START` and `CHANGE_ROUTE_SUCCESS` or `CHANGE_ROUTE_FAILURE` events via flux dispatcher on window `popstate` events


### Example Usage
```js
var RouterMixin = require('flux-router-component').RouterMixin;

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
* getUrl()
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

[LICENSE file]: https://github.com/yahoo/flux-router-component/blob/master/LICENSE.md

Third-pary open source code used are listed in our [package.json file]( https://github.com/yahoo/flux-router-component/blob/master/package.json).

