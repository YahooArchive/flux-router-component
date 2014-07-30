/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var History = require('./History'),
    ACTION_NAVIGATE = 'NAVIGATE',
    EVT_PAGELOAD = 'pageload',
    EVT_POPSTATE = 'popstate',
    RouterMixin;

function routesEqual(route1, route2) {
    route1 = route1 || {};
    route2 = route2 || {};
    return (route1.path === route2.path);
}

RouterMixin = {
    componentDidMount: function() {
        var self = this,
            dispatcher = self.props.dispatcher,
            hash,
            history;

        history = self._routerHistory = new History();

        // At page load, for browsers without pushState AND hash is present in the url:
        //   Since hash fragment is not sent to the server side, we need to
        //   dispatch navigate action on browser side to load the actual page content
        //   for the route represented by the hash fragment.
        if (dispatcher && !history.hasPushState() && (hash = history.getHash())) {
            dispatcher.dispatch(ACTION_NAVIGATE, {type: EVT_PAGELOAD, path: hash});
        }

        self._routerPopstateListener = function (e) {
            if (dispatcher) {
                var path = history.getPath();
                dispatcher.dispatch(ACTION_NAVIGATE, {type: EVT_POPSTATE, path: path, params: e.state});
            }
        };
        self._routerHistory.on(self._routerPopstateListener);
    },
    componentWillUnmount: function() {
        this._routerHistory.off(this._routerPopstateListener);
        this._routerPopstateListener = null;
        this._routerHistory = null;
    },
    componentDidUpdate: function (prevProps, prevState) {
        var newState = this.state;
        if (routesEqual(prevState && prevState.route, newState && newState.route)) {
            return;
        }
        var nav = newState.navigate || {type: newState.navigateType};
        if (nav.type !== EVT_POPSTATE && nav.type !== EVT_PAGELOAD) {
            this._routerHistory.pushState(nav.params || null, null, newState.route.path);
        }
    }
};

module.exports = RouterMixin;
