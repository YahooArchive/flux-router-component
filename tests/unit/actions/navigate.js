/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var expect = require('chai').expect,
    navigateAction = require('../../../actions/navigate'),
    lodash = require('lodash'),
    url = require('url');

describe('navigateAction', function () {
    var mockContext,
        actionCalls,
        homeRoute,
        actionRoute,
        failedRoute,
        stringActionRoute,
        fooAction;

    beforeEach(function () {
        homeRoute = {};
        fooAction = function () {};
        actionRoute = {
            config: {
                action: function () {}
            }
        };
        failedRoute = {
            config: {
                action: function () {}
            }
        };
        stringActionRoute = {
            config: {
                action: 'foo'
            }
        };
        actionCalls = [];
        mockContext = {
            routerCalls: [],
            router: {
                getRoute: function (path, payload) {
                    mockContext.routerCalls.push(arguments);
                    var parsed = path && url.parse(path);
                    var pathname = parsed && parsed.pathname;
                    var route;
                    if ('/' === pathname) {
                        route = lodash.clone(homeRoute);
                    } else if ('/action' === pathname) {
                        route = lodash.clone(actionRoute);
                    } else if ('/fail' === pathname) {
                        route = lodash.clone(failedRoute);
                    } else if ('/string' === pathname) {
                        route = lodash.clone(stringActionRoute);
                    }
                    if (route) {
                        route.path = path;
                    }
                    return route || null;
                }
            },
            executeActionCalls: [],
            getAction: function () {
                return fooAction;
            },
            executeAction: function(action, route, done) {
                mockContext.executeActionCalls.push(arguments);
                if (failedRoute.config.action === action) {
                    done(new Error('test'));
                    return;
                }
                done();
            },
            dispatchCalls: [],
            dispatch: function () {
                mockContext.dispatchCalls.push(arguments);
            }
        };
    });

    it ('should not call anything if the router is not set', function () {
        mockContext.router = undefined;
        navigateAction(mockContext, {
            path: '/'
        }, function () {
            expect(mockContext.routerCalls.length).to.equal(0);
            expect(mockContext.executeActionCalls.length).to.equal(0);
            expect(mockContext.dispatchCalls.length).to.equal(0);
        });
    });

    it ('should dispatch on route match', function () {
        navigateAction(mockContext, {
            path: '/'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.routerCalls.length).to.equal(1);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0][0]).to.equal('CHANGE_ROUTE_START');
            expect(mockContext.dispatchCalls[0][1].path).to.equal('/');
            expect(mockContext.dispatchCalls[0][1].query).to.eql({});
            expect(mockContext.dispatchCalls[1][0]).to.equal('CHANGE_ROUTE_SUCCESS');
            expect(mockContext.dispatchCalls[1][1].path).to.equal('/');
        });
    });

    it ('should include query param on route match', function () {
        navigateAction(mockContext, {
            path: '/?foo=bar&a=b'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.routerCalls.length).to.equal(1);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0][0]).to.equal('CHANGE_ROUTE_START');
            var route = mockContext.dispatchCalls[0][1];
            expect(route.path).to.equal('/?foo=bar&a=b');
            expect(route.query).to.eql({foo: 'bar', a: 'b'}, 'query added to route payload for CHANGE_ROUTE_START' + JSON.stringify(route));
            expect(mockContext.dispatchCalls[1][0]).to.equal('CHANGE_ROUTE_SUCCESS');
            route = mockContext.dispatchCalls[1][1];
            expect(route.path).to.equal('/?foo=bar&a=b');
            expect(route.query).to.eql({foo: 'bar', a: 'b'}, 'query added to route payload for CHANGE_ROUTE_SUCCESS');
        });
    });

    it ('should not call execute action if there is no action', function () {
        navigateAction(mockContext, {
            path: '/'
        }, function () {
            expect(mockContext.executeActionCalls.length).to.equal(0);
        });
    });

    it ('should call execute action if there is a action', function () {
        navigateAction(mockContext, {
            path: '/action'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[1][0]).to.equal('CHANGE_ROUTE_SUCCESS');
            expect(mockContext.dispatchCalls[1][1].path).to.equal('/action');
            expect(mockContext.executeActionCalls.length).to.equal(1);
            expect(mockContext.executeActionCalls[0][0]).to.equal(actionRoute.config.action);
            expect(mockContext.executeActionCalls[0][1].path).to.equal('/action');
            expect(mockContext.executeActionCalls[0][2]).to.be.a('function');
        });
    });

    it ('should call execute action if there is an action as a string', function () {
        navigateAction(mockContext, {
            path: '/string'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[1][0]).to.equal('CHANGE_ROUTE_SUCCESS');
            expect(mockContext.dispatchCalls[1][1].path).to.equal('/string');
            expect(mockContext.executeActionCalls.length).to.equal(1);
            expect(mockContext.executeActionCalls[0][0]).to.equal(fooAction);
            expect(mockContext.executeActionCalls[0][1].path).to.equal('/string');
            expect(mockContext.executeActionCalls[0][2]).to.be.a('function');
        });
    });

    it ('should dispatch failure if action failed', function () {
        navigateAction(mockContext, {
            path: '/fail'
        }, function (err) {
            expect(err).to.be.an('object');
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[1][0]).to.equal('CHANGE_ROUTE_FAILURE');
            expect(mockContext.dispatchCalls[1][1].path).to.equal('/fail');
        });
    });

    it ('should call back with a 404 error if route not found', function () {
        navigateAction(mockContext, {
            path: '/404'
        }, function (err) {
            expect(mockContext.routerCalls.length).to.equal(1);
            expect(err).to.be.an('object');
            expect(err.status).to.equal(404);
        });
    });
});
