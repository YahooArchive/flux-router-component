/**
 * Copyright 2014-2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
'use strict';
var React = require('react');
var objectAssign = require('object-assign');
var debug = require('debug')('RoutingContainer');
var handleRoute = require('../lib/handleRoute');
var navigateAction = require('../lib/navigateAction');
var History = require('./History');
var TYPE_CLICK = 'click';
var TYPE_PAGELOAD = 'pageload';
var TYPE_REPLACESTATE = 'replacestate';
var TYPE_POPSTATE = 'popstate';
var TYPE_DEFAULT = 'default'; // default value if navigation type is missing, for programmatic navigation
var Immutable = require('immutable');

var defaultOptions = {
    checkRouteOnPageLoad: false,
    enableScroll: true,
    historyCreator: function () {
        return new History();
    }
};

// Used for ensuring that only one history handler is created
var historyCreated = false;

/**
 * Enhances a component to handle history management based on RouteStore
 * state.
 * @param {React.Component} Component
 * @param {object} opts
 * @param {boolean} opts.checkRouteOnPageLoad=false Performs navigate on first page load
 * @param {boolean} opts.enableScroll=true Saves scroll position in history state
 * @param {function} opts.historyCreator A factory for creating the history implementation
 * @returns {React.Component}
 */
module.exports = function handleHistory(Component, opts) {
    var options = objectAssign({}, defaultOptions, opts);

    var HistoryHandler = React.createClass({
        contextTypes: {
            executeAction: React.PropTypes.func.isRequired
        },

        propTypes: {
            currentRoute: React.PropTypes.object,
            currentNavigate: React.PropTypes.object
        },

        getDefaultProps: function () {
            return {
                currentRoute: null,
                currentNavigate: null
            };
        },

        componentDidMount: function () {
            if (historyCreated) {
                throw new Error('Only one history handler should be on the ' +
                'page at a time.');
            }
            this._history = options.historyCreator();
            this._scrollTimer = null;

            if (options.checkRouteOnPageLoad) {
                // You probably want to enable checkRouteOnPageLoad, if you use a history implementation
                // that supports hash route:
                //   At page load, for browsers without pushState AND hash is present in the url,
                //   since hash fragment is not sent to the server side, we need to
                //   dispatch navigate action on browser side to load the actual page content
                //   for the route represented by the hash fragment.

                var urlFromHistory = this._history.getUrl();
                var urlFromState = this.props.currentRoute && this.props.currentRoute.get('url');

                if ((urlFromHistory !== urlFromState)) {
                    debug('pageload navigate to actual route', urlFromHistory, urlFromState);
                    this.context.executeAction(navigateAction, {
                        type: TYPE_PAGELOAD,
                        url: urlFromHistory
                    });
                }
            }
            this._history.on(this._onHistoryChange);

            if (options.enableScroll) {
                window.addEventListener('scroll', this._onScroll);
            }
        },
        _onScroll: function (e) {
            if (this._scrollTimer) {
                window.clearTimeout(this._scrollTimer);
            }
            this._scrollTimer = window.setTimeout(this._saveScrollPosition, 150);
        },
        _onHistoryChange: function (e) {
            var url = this._history.getUrl();
            var currentUrl = this.props.currentRoute && this.props.currentRoute.get('url');
            debug('history listener invoked', e, url, currentUrl);
            if (url !== currentUrl) {
                this.context.executeAction(navigateAction, {
                    type: TYPE_POPSTATE,
                    url: url,
                    params: (e.state && e.state.params)
                });
            }
        },
        _saveScrollPosition: function (e) {
            var historyState = (this._history.getState && this._history.getState()) || {};
            historyState.scroll = {x: window.scrollX, y: window.scrollY};
            debug('remember scroll position', historyState.scroll);
            this._history.replaceState(historyState);
        },
        componentWillUnmount: function () {
            this._history.off(this._onHistoryChange);

            if (options.enableScroll) {
                window.removeEventListener('scroll', this._onScroll);
            }

            historyCreated = false;
        },
        shouldComponentUpdate: function (nextProps) {
            return !Immutable.is(nextProps.currentRoute, this.props.currentRoute);
        },
        componentDidUpdate: function (prevProps, prevState) {
            debug('component did update', prevState, this.props);
            var nav = this.props.currentNavigate;
            var navType = (nav && nav.type) || TYPE_DEFAULT;
            var navParams = nav.params || {};
            var historyState;

            switch (navType) {
                case TYPE_CLICK:
                case TYPE_DEFAULT:
                case TYPE_REPLACESTATE:
                    historyState = {params: navParams};
                    if (options.enableScroll) {
                        if (nav.preserveScrollPosition) {
                            historyState.scroll = {x: window.scrollX, y: window.scrollY};
                        } else {
                            window.scrollTo(0, 0);
                            historyState.scroll = {x: 0, y: 0};
                            debug('on click navigation, reset scroll position to (0, 0)');
                        }
                    }
                    var pageTitle = navParams.pageTitle || null;
                    if (navType == TYPE_REPLACESTATE) {
                        this._history.replaceState(historyState, pageTitle, nav.url);
                    } else {
                        this._history.pushState(historyState, pageTitle, nav.url);
                    }
                    break;
                case TYPE_POPSTATE:
                    if (options.enableScroll) {
                        historyState = (this._history.getState && this._history.getState()) || {};
                        var scroll = (historyState && historyState.scroll) || {};
                        debug('on popstate navigation, restore scroll position to ', scroll);
                        window.scrollTo(scroll.x || 0, scroll.y || 0);
                    }
                    break;
            }
        },

        render: function () {
            return React.createElement(Component, this.props);
        }
    });

    return handleRoute(HistoryHandler);
};
