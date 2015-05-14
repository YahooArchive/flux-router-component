/**
 * Copyright 2014-2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
'use strict';

var debug = require('debug')('RouterMixin');
var navigateAction = require('../actions/navigate');
var History = require('./History');
var React = require('react');
var TYPE_CLICK = 'click';
var TYPE_PAGELOAD = 'pageload';
var TYPE_REPLACESTATE = 'replacestate';
var TYPE_POPSTATE = 'popstate';
var TYPE_DEFAULT = 'default'; // default value if navigation type is missing, for programmatic navigation
var RouterMixin;

require('setimmediate');

function routesEqual(route1, route2) {
    route1 = route1 || {};
    route2 = route2 || {};
    return (route1.url === route2.url);
}

function saveScrollPosition(e, history) {
    var historyState = (history.getState && history.getState()) || {};
    historyState.scroll = {x: window.scrollX, y: window.scrollY};
    debug('remember scroll position', historyState.scroll);
    history.replaceState(historyState);
}

RouterMixin = {
    contextTypes: {
        executeAction: React.PropTypes.func,
        makePath: React.PropTypes.func
    },
    childContextTypes: {
        makePath: React.PropTypes.func
    },
    getChildContext: function(){
        var context = {};
        Object.keys(RouterMixin.childContextTypes).forEach(function (key) {
            context[key] = (this.props.context && this.props.context[key]) || this.context[key];
        }, this);
        return context;
    },
    componentDidMount: function() {
        var self = this;
        var context;
        var urlFromHistory;
        var urlFromState;

        if (self.context && self.context.executeAction) {
            context = self.context;
        } else if (self.props.context && self.props.context.executeAction) {
            context = self.props.context;
        }

        self._history = ('function' === typeof self.props.historyCreator) ? self.props.historyCreator() : new History();
        self._enableScroll = (self.props.enableScroll !== false);

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
                    context.executeAction(navigateAction, {type: TYPE_PAGELOAD, url: urlFromHistory});
                });
            }
        }

        self._historyListener = function (e) {
            debug('history listener invoked', e, url, self.state.route.url);

            if (context) {
                var state = self.state || {};
                var url = self._history.getUrl();
                var currentUrl = state.route.url;
                var route = state.route || {};
                var onBeforeUnloadText = typeof window.onbeforeunload === 'function' ? window.onbeforeunload() : '';
                var confirmResult = onBeforeUnloadText ? window.confirm(onBeforeUnloadText) : true;
                var nav = route.navigate || {};
                var navParams = nav.params || {};
                var historyState = {
                    params: (nav.params || {})
                };
                var pageTitle = navParams.pageTitle || null;

                if (!confirmResult && currentUrl) {
                    // Pushes the previous history state back on top to set the correct url
                    self._history.pushState(historyState, pageTitle, currentUrl);
                } else {
                    window.onbeforeunload = null;

                    if (url !== currentUrl) {
                        context.executeAction(navigateAction, {type: TYPE_POPSTATE, url: url, params: (e.state && e.state.params)});
                    }
                }
            }
        };
        self._history.on(self._historyListener);

        if (self._enableScroll) {
            var scrollTimer;
            self._scrollListener = function (e) {
                if (scrollTimer) {
                    window.clearTimeout(scrollTimer);
                }
                scrollTimer = window.setTimeout(saveScrollPosition.bind(self, e, self._history), 150);
            };
            window.addEventListener('scroll', self._scrollListener);
        }
    },
    componentWillUnmount: function() {
        this._history.off(this._historyListener);
        this._historyListener = null;

        if (this._enableScroll) {
            window.removeEventListener('scroll', this._scrollListener);
            this._scrollListener = null;
        }

        this._history = null;
    },
    componentDidUpdate: function (prevProps, prevState) {
        debug('component did update', prevState, this.state);

        var newState = this.state;
        if (routesEqual(prevState && prevState.route, newState && newState.route)) {
            return;
        }

        var nav = newState.route.navigate || {};
        var navType = nav.type || TYPE_DEFAULT;
        var historyState;
        var pageTitle;

        switch (navType) {
            case TYPE_CLICK:
            case TYPE_DEFAULT:
            case TYPE_REPLACESTATE:
                historyState = {params: (nav.params || {})};
                if(this._enableScroll) {
                    if (nav.preserveScrollPosition) {
                        historyState.scroll = {x: window.scrollX, y: window.scrollY};
                    } else {
                        window.scrollTo(0, 0);
                        historyState.scroll = {x: 0, y: 0};
                        debug('on click navigation, reset scroll position to (0, 0)');
                    }
                }
                pageTitle = nav.params && nav.params.pageTitle || null;
                if(navType == TYPE_REPLACESTATE) {
                    this._history.replaceState(historyState, pageTitle, newState.route.url);
                } else {
                    this._history.pushState(historyState, pageTitle, newState.route.url);
                }
                break;
            case TYPE_POPSTATE:
                if (this._enableScroll) {
                    historyState = (this._history.getState && this._history.getState()) || {};
                    var scroll = (historyState && historyState.scroll) || {};
                    debug('on popstate navigation, restore scroll position to ', scroll);
                    window.scrollTo(scroll.x || 0, scroll.y || 0);
                }
                break;
        }
    }
};

module.exports = RouterMixin;
