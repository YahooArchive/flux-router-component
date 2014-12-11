/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('NavLink');
var navigateAction = require('../actions/navigate');
var History = require('./History');
var EVT_PAGELOAD = 'pageload';
var EVT_POPSTATE = 'popstate';
var RouterMixin;

require('setimmediate');

function routesEqual(route1, route2) {
    route1 = route1 || {};
    route2 = route2 || {};
    return (route1.url === route2.url);
}

RouterMixin = {
    componentDidMount: function() {
        var self = this,
            context = self.props.context,
            urlFromHistory,
            urlFromState;

        self._history = ('function' === typeof self.props.historyCreator) ? self.props.historyCreator() : new History();

        if (self.props.checkRouteOnPageLoad) {
            // You probably want to enable checkRouteOnPageLoad, if you use a history implementation
            // that supports hash route:
            //   At page load, for browsers without pushState AND hash is present in the url,
            //   since hash fragment is not sent to the server side, we need to
            //   dispatch navigate action on browser side to load the actual page content
            //   for the route represented by the hash fragment.

            urlFromHistory = self._history.getUrl();
            urlFromState = self.state && self.state.route && self.state.route.url;

            if (context && (urlFromHistory !== urlFromState)) {
                // put it in setImmediate, because we need the base component to have
                // store listeners attached, before navigateAction is executed.
                debug('pageload navigate to actual route', urlFromHistory, urlFromState);
                setImmediate(function navigateToActualRoute() {
                    context.executeAction(navigateAction, {type: EVT_PAGELOAD, url: urlFromHistory});
                });
            }
        }

        self._historyListener = function (e) {
            if (context) {
                var url = self._history.getUrl();
                debug('history listener invoked', e, url, self.state.route.url);
                if (url !== self.state.route.url) {
                    context.executeAction(navigateAction, {type: EVT_POPSTATE, url: url, params: e.state});
                }
            }
        };
        self._history.on(self._historyListener);
    },
    componentWillUnmount: function() {
        this._history.off(this._historyListener);
        this._historyListener = null;
        this._history = null;
    },
    componentDidUpdate: function (prevProps, prevState) {
        debug('component did update', prevState, this.state);

        var newState = this.state;
        if (routesEqual(prevState && prevState.route, newState && newState.route)) {
            return;
        }

        var nav = newState.route.navigate;
        if (nav.type !== EVT_POPSTATE && nav.type !== EVT_PAGELOAD) {
            this._history.pushState(nav.params || null, null, newState.route.url);
        }
    }
};

module.exports = RouterMixin;
