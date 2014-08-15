/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var expect = require('chai').expect,
    navigateAction = require('../../../actions/navigate');

describe('navigateAction', function () {
    var mockContext,
        handlerCalls,
        homeRoute,
        handlerRoute;

    beforeEach(function () {
        homeRoute = {};
        handlerRoute = {
            config: {
                handler: function () {
                    mockContext.handlerCalls.push(arguments);
                }
            }
        };
        handlerCalls = [];
        mockContext = {
            routerCalls: [],
            router: {
                getRoute: function (path, payload) {
                    mockContext.routerCalls.push(arguments);
                    if ('/' === path) {
                        return homeRoute;
                    } else if ('/handler' === path) {
                        return handlerRoute;
                    }
                    return null;
                }
            },
            executeActionCalls: [],
            executeAction: function(handler, route, done) {
                mockContext.executeActionCalls.push(arguments);
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
            expect(mockContext.dispatchCalls.length).to.equal(1);
            expect(mockContext.dispatchCalls[0][0]).to.equal('CHANGE_ROUTE');
            expect(mockContext.dispatchCalls[0][1]).to.equal(homeRoute);
        });
    });

    it ('it should not call execute action if there is no handler', function () {
        navigateAction(mockContext, {
            path: '/'
        }, function () {
            expect(mockContext.executeActionCalls.length).to.equal(0);
        });
    });

    it ('it should call execute action if there is a handler', function () {
        navigateAction(mockContext, {
            path: '/handler'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(1);
            expect(mockContext.executeActionCalls.length).to.equal(1);
            expect(mockContext.executeActionCalls[0][0]).to.equal(handlerRoute.config.handler);
            expect(mockContext.executeActionCalls[0][1]).to.equal(handlerRoute);
            expect(mockContext.executeActionCalls[0][2]).to.be.a('function');
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
