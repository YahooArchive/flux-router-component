/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

module.exports = {
    plugin: require('./lib/router-plugin'),
    NavLink: require('./lib/NavLink'),
    RouterMixin: require('./lib/RouterMixin'),
    navigateAction: require('./actions/navigate'),
    History: require('./lib/History')
};
