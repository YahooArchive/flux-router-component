/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var expect = require('chai').expect,
    navigateAction = require('../../../actions/navigate'),
    lodash = require('lodash'),
    urlParser = require('url');

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
        postMethodRoute = {
            config: {
                action: function () {},
                method: 'post'
            }
        };
        actionCalls = [];
        mockContext = {
            routerCalls: [],
            router: {
                getRoute: function (url, options) {
                    mockContext.routerCalls.push(arguments);
                    var parsed = url && urlParser.parse(url);
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
                    } else if ('/post' === pathname && postMethodRoute.config.method === options.method) {
                        route = lodash.clone(postMethodRoute);
                    }
                    if (route) {
                        route.url = url;
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
            url: '/'
        }, function () {
            expect(mockContext.routerCalls.length).to.equal(0);
            expect(mockContext.executeActionCalls.length).to.equal(0);
            expect(mockContext.dispatchCalls.length).to.equal(0);
        });
    });

    it ('should dispatch on route match', function () {
        navigateAction(mockContext, {
            url: '/'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.routerCalls.length).to.equal(1);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0][0]).to.equal('CHANGE_ROUTE_START');
            expect(mockContext.dispatchCalls[0][1].url).to.equal('/');
            expect(mockContext.dispatchCalls[0][1].query).to.eql({});
            expect(mockContext.dispatchCalls[1][0]).to.equal('CHANGE_ROUTE_SUCCESS');
            expect(mockContext.dispatchCalls[1][1].url).to.equal('/');
        });
    });

    it ('should include query param on route match', function () {
        var url = '/?foo=bar&a=b&a=c&bool#abcd=fff';
        navigateAction(mockContext, {
            url: url
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.routerCalls.length).to.equal(1);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0][0]).to.equal('CHANGE_ROUTE_START');
            var route = mockContext.dispatchCalls[0][1];
            expect(route.url).to.equal(url);
            expect(route.query).to.eql({foo: 'bar', a: ['b', 'c'], bool: null}, 'query added to route payload for CHANGE_ROUTE_START' + JSON.stringify(route));
            expect(mockContext.dispatchCalls[1][0]).to.equal('CHANGE_ROUTE_SUCCESS');
            route = mockContext.dispatchCalls[1][1];
            expect(route.url).to.equal(url);
            expect(route.query).to.eql({foo: 'bar', a: ['b', 'c'], bool: null}, 'query added to route payload for CHANGE_ROUTE_SUCCESS');
        });
    });

    it ('should not call execute action if there is no action', function () {
        navigateAction(mockContext, {
            url: '/'
        }, function () {
            expect(mockContext.executeActionCalls.length).to.equal(0);
        });
    });

    it ('should call execute action if there is a action', function () {
        navigateAction(mockContext, {
            url: '/action'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[1][0]).to.equal('CHANGE_ROUTE_SUCCESS');
            expect(mockContext.dispatchCalls[1][1].url).to.equal('/action');
            expect(mockContext.executeActionCalls.length).to.equal(1);
            expect(mockContext.executeActionCalls[0][0]).to.equal(actionRoute.config.action);
            expect(mockContext.executeActionCalls[0][1].url).to.equal('/action');
            expect(mockContext.executeActionCalls[0][2]).to.be.a('function');
        });
    });

    it ('should call execute action if there is an action as a string', function () {
        navigateAction(mockContext, {
            url: '/string'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[1][0]).to.equal('CHANGE_ROUTE_SUCCESS');
            expect(mockContext.dispatchCalls[1][1].url).to.equal('/string');
            expect(mockContext.executeActionCalls.length).to.equal(1);
            expect(mockContext.executeActionCalls[0][0]).to.equal(fooAction);
            expect(mockContext.executeActionCalls[0][1].url).to.equal('/string');
            expect(mockContext.executeActionCalls[0][2]).to.be.a('function');
        });
    });

    it ('should dispatch failure if action failed', function () {
        navigateAction(mockContext, {
            url: '/fail'
        }, function (err) {
            expect(err).to.be.an('object');
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[1][0]).to.equal('CHANGE_ROUTE_FAILURE');
            expect(mockContext.dispatchCalls[1][1].url).to.equal('/fail');
        });
    });

    it ('should call back with a 404 error if route not found', function () {
        navigateAction(mockContext, {
            url: '/404'
        }, function (err) {
            expect(mockContext.routerCalls.length).to.equal(1);
            expect(err).to.be.an('object');
            expect(err.status).to.equal(404);
        });
    });

    it ('should call back with a 404 error if url matches but not method', function () {
        navigateAction(mockContext, {
            url: '/post',
            method: 'get'
        }, function (err) {
            expect(mockContext.routerCalls.length).to.equal(1);
            expect(err).to.be.an('object');
            expect(err.status).to.equal(404);
        });
    });

    it ('should dispatch if both url and method matches', function () {
        navigateAction(mockContext, {
            url: '/post',
            method: 'post'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.routerCalls.length).to.equal(1);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0][0]).to.equal('CHANGE_ROUTE_START');
            expect(mockContext.dispatchCalls[0][1].url).to.equal('/post');
            expect(mockContext.dispatchCalls[0][1].query).to.eql({});
            expect(mockContext.dispatchCalls[1][0]).to.equal('CHANGE_ROUTE_SUCCESS');
            expect(mockContext.dispatchCalls[1][1].url).to.equal('/post');
        });
    });
});
