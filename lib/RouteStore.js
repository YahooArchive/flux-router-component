/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons/createStore');
var Router = require('routr');
var queryString = require('query-string');
var searchPattern = /\?([^\#]*)/;
var inherits = require('inherits');
var objectAssign = require('object-assign');
var Immutable = require('immutable');

var RouteStore = createStore({
    storeName: 'RouteStore',
    handlers: {
        'NAVIGATE_START': 'handleNavigateStart',
        'RECEIVE_ROUTES': 'handleReceiveRoutes'
    },
    initialize: function () {
        this.routes = null;
        this.currentUrl = null;
        this.currentRoute = null;
        this.currentNavigate = null;
        this.router = null;
    },
    handleNavigateStart: function (payload) {
        var options = {
            navigate: payload,
            method: payload.method
        };

        this.currentUrl = payload.url;
        var matchedRoute = this._matchRoute(payload.url, options);
        if (!Immutable.is(matchedRoute, this.currentRoute)) {
            this.currentRoute = matchedRoute;
            this.currentNavigate = payload;
            this.emitChange();
        }
    },
    _matchRoute: function (url, options) {
        var self = this;
        var route = self.getRouter().getRoute(url, options);
        if (!route) {
            return null;
        }

        var matchedUrl = route.url;
        route = Immutable.fromJS(route.config).withMutations(function (r) {
            r.set('name', route.name);
            r.set('url', route.url);
            r.set('params', Immutable.fromJS(route.params));
            r.set('query', Immutable.fromJS(self._parseQueryString(matchedUrl)));
        });

        return route;
    },
    _parseQueryString: function (url) {
        var matches = url.match(searchPattern);
        var search;
        if (matches) {
            search = matches[1];
        }
        return (search && queryString.parse(search)) || {};
    },
    handleReceiveRoutes: function (payload) {
        this.routes = objectAssign(this.routes || {}, payload);
        // Reset the router so that it is recreated next time it's needed
        this.router = null;
        this.emitChange();
    },
    makePath: function (routeName, params) {
        return this.getRouter().makePath(routeName, params);
    },
    getCurrentRoute: function () {
        return this.currentRoute;
    },
    getCurrentNavigate: function () {
        return this.currentNavigate;
    },
    getRoutes: function () {
        return this.routes;
    },
    getRouter: function () {
        if (!this.router) {
            this.router = new Router(this.getRoutes());
        }
        return this.router;
    },
    isActive: function (href) {
        return this.currentUrl === href;
    },
    dehydrate: function () {
        return {
            currentUrl: this.currentUrl,
            currentNavigate: this.currentNavigate,
            routes: this.routes
        };
    },
    rehydrate: function (state) {
        this.routes = state.routes;
        this.currentUrl = state.currentUrl;
        this.currentRoute = this._matchRoute(this.currentUrl, {method: 'GET'});
        this.currentNavigate = state.currentNavigate;
    }
});

RouteStore.withStaticRoutes = function (staticRoutes) {
    function StaticRouteStore() {
        RouteStore.apply(this, arguments);
    }
    inherits(StaticRouteStore, RouteStore);
    StaticRouteStore.storeName = RouteStore.storeName;
    StaticRouteStore.handlers = RouteStore.handlers;
    StaticRouteStore.routes = staticRoutes || {};
    StaticRouteStore.prototype.getRoutes = function () {
        return objectAssign({}, StaticRouteStore.routes, this.routes || {});
    };
    return StaticRouteStore;
};

module.exports = RouteStore;
