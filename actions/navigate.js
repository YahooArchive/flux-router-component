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
    var routeHandler = route.config && route.config.handler;
    if (!routeHandler) {
        done();
        return;
    }

    // Execute route handler
    context.executeAction(routeHandler, route, function (err) {
        if (err) {
            context.dispatch('CHANGE_ROUTE_FAILURE', route);
        } else {
            context.dispatch('CHANGE_ROUTE_SUCCESS', route);
        }
        done(err);
    });
};
