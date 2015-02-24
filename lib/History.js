/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
'use strict';

var EVENT_POPSTATE = 'popstate';

/**
 * This only supports pushState for the browsers with native pushState support.
 * For other browsers (mainly IE8 and IE9), it will refresh the page upon pushState()
 * and replaceState().
 * @class History
 * @constructor
 * @param {Object} [options]  The options object
 * @param {Window} [options.win=window]  The window object
 */
function History(options) {
    this.win = (options && options.win) || window;
    this._hasPushState = !!(this.win && this.win.history && this.win.history.pushState);
}

History.prototype = {
    /**
     * Add the given listener for 'popstate' event (nothing happens for browsers that
     * don't support popstate event).
     * @method on
     * @param {Function} listener
     */
    on: function (listener) {
        if (this._hasPushState) {
            this.win.addEventListener(EVENT_POPSTATE, listener);
        }
    },

    /**
     * Remove the given listener for 'popstate' event (nothing happens for browsers that
     * don't support popstate event).
     * @method off
     * @param {Function} listener
     */
    off: function (listener) {
        if (this._hasPushState) {
            this.win.removeEventListener(EVENT_POPSTATE, listener);
        }
    },

    /**
     * @method getState
     * @return {Object|null} The state object in history
     */
    getState: function () {
        return (this.win.history && this.win.history.state) || null;
    },

    /**
     * Gets the path string, including the pathname and search query (if it exists).
     * @method getUrl
     * @return {String} The url string that denotes current route path and query
     */
    getUrl: function () {
        var location = this.win.location;
        return location.pathname + location.search;
    },

    /**
     * Same as HTML5 pushState API, but with old browser support
     * @method pushState
     * @param {Object} state The state object
     * @param {String} title The title string
     * @param {String} url The new url
     */
    pushState: function (state, title, url) {
        var win = this.win;
        if (this._hasPushState) {
            try {
                // not calling pushState(state, title, url), because
                // some browsers update url with '/undefined' if url is undefined
                win.history.pushState.apply(win.history, arguments);
            } catch (error) {
                // firefox 35 requires 3 args for pushState
                if (arguments.length < 3) {
                    win.history.pushState(state, title, url);
                }
            }
        } else if (url) {
            win.location.href = url;
        }
    },

    /**
     * Same as HTML5 replaceState API, but with old browser support
     * @method replaceState
     * @param {Object} state The state object
     * @param {String} title The title string
     * @param {String} url The new url
     */
    replaceState: function (state, title, url) {
        var win = this.win;
        if (this._hasPushState) {
            try {
                // not calling pushState(state, title, url), because
                // some browsers update url with '/undefined' if url is undefined
                win.history.replaceState.apply(win.history, arguments);
            } catch (error) {
                // firefox 35 requires 3 args for replaceState
                if (arguments.length < 3) {
                    win.history.replaceState(state, title, url);
                }
            }
        } else if (url) {
            win.location.replace(url);
        }
    }
};

module.exports = History;
