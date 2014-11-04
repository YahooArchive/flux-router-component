var debug = require('debug')('navigateAction'),
    queryString = require('query-string'),
    searchPattern = /\?([^\#]*)/;

function parseQueryString(path) {
    var search;
    var matches = path.match(searchPattern);
    if (matches) {
        search = matches[1];
    }
    return (search && queryString.parse(search)) || {};
}

module.exports = function (context, payload, done) {
    if (!context.router || !context.router.getRoute) {
        debug('no router available for navigate handling');
        done(new Error('missing router'));
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

    // add parsed query parameter object to route object,
    // and make it part of CHANGE_ROUTE_XXX action payload.
    route.query = parseQueryString(route.path);

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
