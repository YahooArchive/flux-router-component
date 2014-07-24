/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var History = require('./History'),
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
            dispatcher = self.props.dispatcher;
        this._routerHistory = new History();
        this._routerPopstateListener = function (e) {
            if (dispatcher) {
                var path = self._routerHistory.getPath();
                dispatcher.dispatch('NAVIGATE', {type: EVT_POPSTATE, path: path, params: e.state});
            }
        };
        this._routerHistory.on(this._routerPopstateListener);
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
        if (nav.type !== EVT_POPSTATE) {
            this._routerHistory.pushState(nav.params || null, null, newState.route.path);
        }
    }
};

module.exports = RouterMixin;
