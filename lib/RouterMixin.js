/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
'use strict';

var RouterMixin;

function routesEqual(route1, route2) {
    route1 = route1 || {};
    route2 = route2 || {};
    return (route1.path === route2.path);
}

RouterMixin = {
    componentDidMount: function() {
        var dispatcher = this.props.dispatcher;
        this._routerPopstateListener = function (e) {
            if (dispatcher) {
                dispatcher.dispatch('NAVIGATE', {path: window.location.pathname, params: e.state});
            }
        };
        window.addEventListener('popstate', this._routerPopstateListener);
    },
    componentWillUnmount: function() {
        window.removeEventListener('popstate', this._routerPopstateListener);
        this._routerPopstateListener = null;
    },
    componentDidUpdate: function (prevProps, prevState) {
        if (routesEqual(prevState && prevState.route, this.state && this.state.route)) {
            return;
        }
        window.history.pushState(null, null, this.state.route.path);
    }
};

module.exports = RouterMixin;
