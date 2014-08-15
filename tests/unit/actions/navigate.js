/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var expect = require('chai').expect,
    navigateAction = require('../../../actions/navigate');

describe('navigateAction', function () {
    var mockContext,
        actionCalls,
        homeRoute,
        actionRoute,
        failedRoute;

    beforeEach(function () {
        homeRoute = {};
        actionRoute = {
            config: {
                action: function () {
                    mockContext.actionCalls.push(arguments);
                }
            }
        };
        failedRoute = {
            config: {
                action: function () {
                    mockContext.actionCalls.push(arguments);
                }
            }
        };
        actionCalls = [];
        mockContext = {
            routerCalls: [],
            router: {
                getRoute: function (path, payload) {
                    mockContext.routerCalls.push(arguments);
                    if ('/' === path) {
                        return homeRoute;
                    } else if ('/action' === path) {
                        return actionRoute;
                    } else if ('/fail' === path) {
                        return failedRoute;
                    }
                    return null;
                }
            },
            executeActionCalls: [],
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

    it ('it should dispatch on route match', function () {
        navigateAction(mockContext, {
            path: '/'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.routerCalls.length).to.equal(1);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0][0]).to.equal('CHANGE_ROUTE_START');
            expect(mockContext.dispatchCalls[0][1]).to.equal(homeRoute);
            expect(mockContext.dispatchCalls[1][0]).to.equal('CHANGE_ROUTE_SUCCESS');
            expect(mockContext.dispatchCalls[1][1]).to.equal(homeRoute);
        });
    });

    it ('it should not call execute action if there is no action', function () {
        navigateAction(mockContext, {
            path: '/'
        }, function () {
            expect(mockContext.executeActionCalls.length).to.equal(0);
        });
    });

    it ('it should call execute action if there is a action', function () {
        navigateAction(mockContext, {
            path: '/action'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[1][0]).to.equal('CHANGE_ROUTE_SUCCESS');
            expect(mockContext.dispatchCalls[1][1]).to.equal(actionRoute);
            expect(mockContext.executeActionCalls.length).to.equal(1);
            expect(mockContext.executeActionCalls[0][0]).to.equal(actionRoute.config.action);
            expect(mockContext.executeActionCalls[0][1]).to.equal(actionRoute);
            expect(mockContext.executeActionCalls[0][2]).to.be.a('function');
        });
    });

    it ('it should dispatch failure if action failed', function () {
        navigateAction(mockContext, {
            path: '/fail'
        }, function (err) {
            expect(err).to.be.an('object');
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[1][0]).to.equal('CHANGE_ROUTE_FAILURE');
            expect(mockContext.dispatchCalls[1][1]).to.equal(failedRoute);
        });
    });

    it ('it should call back with a 404 error if route not found', function () {
        navigateAction(mockContext, {
            path: '/404'
        }, function (err) {
            expect(mockContext.routerCalls.length).to.equal(1);
            expect(err).to.be.an('object');
            expect(err.status).to.equal(404);
        });
    });
});
