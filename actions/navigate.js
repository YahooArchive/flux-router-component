var debug = require('debug')('navigateAction');

module.exports = function (payload, done) {
    if (!this.router || !this.router.getRoute) {
        debug('no router available for navigate handling');
        return;
    }
    debug('executing', payload);
    var route = this.router.getRoute(payload.path, {navigate: payload});

    if (!route) {
        var err = new Error('Url does not exist');
        err.status = 404;
        done(err);
        return;
    }
    debug('dispatching CHANGE_ROUTE', route);
    this.dispatch('CHANGE_ROUTE', route);
    var routeHandler = route.config && route.config.handler;
    if (!routeHandler) {
        done();
        return;
    }

    // Execute route handler
    this.executeAction(routeHandler, route, done);
    done();
};
