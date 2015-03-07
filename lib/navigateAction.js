/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
var debug = require('debug')('navigateAction');

module.exports = function (context, payload, done) {
    debug('dispatching NAVIGATE_START', payload);
    context.dispatch('NAVIGATE_START', payload);

    var routeStore = context.getStore('RouteStore');
    if (!routeStore.getCurrentRoute) {
        done(new Error('RouteStore has not implemented `getCurrentRoute` method.'));
        return;
    }
    debug('executing', payload);

    var route = routeStore.getCurrentRoute();

    if (!route) {
        context.dispatch('NAVIGATE_FAILURE', payload);
        var err = new Error('Url does not exist');
        err.status = 404;
        done(err);
        return;
    }

    var action = route.get('action');

    if ('string' === typeof action && context.getAction) {
        action = context.getAction(action);
    }

    if (!action || 'function' !== typeof action) {
        debug('route has no action, dispatching without calling action');
        context.dispatch('NAVIGATE_SUCCESS', payload);
        done();
        return;
    }

    debug('executing route action');
    context.executeAction(action, route, function (err) {
        if (err) {
            context.dispatch('NAVIGATE_FAILURE', payload);
        } else {
            context.dispatch('NAVIGATE_SUCCESS', payload);
        }
        done(err);
    });
};
