var debug = require('debug')('navigateAction');

module.exports = function (context, payload, done) {
    if (!context.router || !context.router.getRoute) {
        debug('no router available for navigate handling');
        return;
    }
    debug('executing', payload);
    var route = context.router.getRoute(payload.path, {navigate: payload});

    if (!route) {
        var err = new Error('Url does not exist');
        err.status = 404;
        done(err);
        return;
    }
    debug('dispatching CHANGE_ROUTE', route);
    context.dispatch('CHANGE_ROUTE_START', route);
    var action = route.config && route.config.action;

    if ('string' === typeof action && context.getAction) {
        action = context.getAction(action);
    }

    if (!action || 'function' !== typeof action) {
        debug('route has no action, dispatching without calling action');
        context.dispatch('CHANGE_ROUTE_SUCCESS', route);
        done();
        return;
    }

    debug('executing route action');
    context.executeAction(action, route, function (err) {
        if (err) {
            context.dispatch('CHANGE_ROUTE_FAILURE', route);
        } else {
            context.dispatch('CHANGE_ROUTE_SUCCESS', route);
        }
        done(err);
    });
};
