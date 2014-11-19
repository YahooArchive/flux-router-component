/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var Router = require('routr');

module.exports = function routerPlugin(options) {
    options = options || {};
    var routes = options.routes;
    /**
     * @class RouterPlugin
     */
    return {
        name: 'RouterPlugin',
        /**
         * Called to plug the FluxContext
         * @method plugContext
         * @returns {Object}
         */
        plugContext: function plugContext() {
            var router = new Router(routes);
            return {
                /**
                 * Provides full access to the router in the action context
                 * @param {Object} actionContext
                 */
                plugActionContext: function plugActionContext(actionContext) {
                    actionContext.router = router;
                },
                /**
                 * Provides access to create paths by name
                 * @param {Object} componentContext
                 */
                plugComponentContext: function plugComponentContext(componentContext) {
                    componentContext.makePath = router.makePath.bind(router);
                }
            };
        },
        /**
         * @method getRoutes
         * @returns {Object}
         */
        getRoutes: function getRoutes() {
            return routes;
        }
    };
};
