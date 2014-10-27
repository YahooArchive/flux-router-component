/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
'use strict';

var relativePathRegex = /^(?:\/\/|[^\/]+)*\/?/,
    matchHashRegex = /(javascript:|#).*$/;

function getRelativePath(url) {
    return url && url.replace(relativePathRegex, '/');
}

/**
 * @class History
 * @constructor
 * @param {Window} [win=window]  The window object
 */
function History(win) {
    // check browser support conditions. Support IE8+
    this.win = win || window;
    this._hasPushState = !!(this.win && this.win.history && this.win.history.pushState);
    this._popstateEvt = this._hasPushState ? 'popstate' : 'hashchange';
}

History.prototype = {
    /**
     * Add the given listener for 'popstate' event (fall backs to 'hashchange' event
     * for browsers don't support popstate event).
     * @method on
     * @param {Function} listener
     */
    on: function (listener) {
        this.win.addEventListener(this._popstateEvt, listener);
    },

    /**
     * Remove the given listener for 'popstate' event (fall backs to 'hashchange' event
     * for browsers don't support popstate event).
     * @method off
     * @param {Function} listener
     */
    off: function (listener) {
        this.win.removeEventListener(this._popstateEvt, listener);
    },

    /**
     * Returns the hash fragment in current window location.
     * @method getHash
     * @return {String} The hash fragment string (without the # prefix).
     */
    getHash: function () {
        var hash = this.win.location.hash || '';
        // remove the '#' prefix
        return hash.substring(1) || '';
    },

    /**
     * Gets the path string (or hash fragment for old browsers that don't support pushState),
     * including the pathname and search query (if it exists).
     * @method getPath
     * @return {String} The path string that denotes current route path
     */
    getPath: function () {
        var location = this.win.location,
            path = location.pathname + location.search;

        if (!this._hasPushState) {
            return this.getHash() || path;
        }
        return path;
    },

    /**
     * Whether pushState is natively supported.
     * @method hasPushState
     * @return {Boolean} true if native support is found; false otherwise.
     */
    hasPushState: function () {
        return this._hasPushState;
    },

    /**
     * Same as HTML5 pushState API, but with old browser support
     * @method pushState
     * @param {Object} state The state object
     * @param {String} title The title string
     * @param {String} url The new url
     */
    pushState: function (state, title, url) {
        this._updateState(state, title, url, false);
    },

    /**
     * Same as HTML5 replaceState API, but with old browser support
     * @method replaceState
     * @param {Object} state The state object
     * @param {String} title The title string
     * @param {String} url The new url
     */
    replaceState: function (state, title, url) {
        this._updateState(state, title, url, true);
    },

    /**
     * push or replace the history state, with old browser support
     * @method _updateState
     * @param {Object} state The state object
     * @param {String} title The title string
     * @param {String} url The new url
     * @param {Boolean} replace Whether to replace browser state
     * @private
     */
    _updateState: function (state, title, url, replace) {
        var self = this;
        if (self._hasPushState) {
            var method = replace ? 'replaceState' : 'pushState';
            self.win.history[method](state, title, url);
        } else {
            // no pushstate support, use hash
            self._updateHash(state, title, url, replace);
        }
    },

    /**
     * update hash fragment, used in old browser
     * @method _updateHash
     * @param {Object} state The state object
     * @param {String} title The title string
     * @param {String} url The new url
     * @param {Boolean} replace Whether to replace browser state
     * @private
     */
    _updateHash: function (state, title, url, replace) {
        var fragment = getRelativePath(url),
            location = this.win.location;
        if (fragment) {
            if (replace) {
                var href = location.href.replace(matchHashRegex, '');
                location.replace(href + '#' + fragment);
            } else {
                location.hash = '#' + fragment;
            }
        }
    }
};

module.exports = History;
