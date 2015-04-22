/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var expect = require('chai').expect;
var navigateAction = require('../../../lib/navigateAction');
var createMockActionContext = require('fluxible/utils/createMockActionContext');
var RouteStore = require('../../../').RouteStore;

describe('navigateAction', function () {
    var mockContext;
    var routes = {
        home: {
            method: 'get',
            path: '/'
        },
        action: {
            method: 'get',
            path: '/action',
            action: function (context, payload, done) {
                done();
            }
        },
        fail: {
            method: 'get',
            path: '/fail',
            action: function (context, payload, done) {
                done(new Error('fail'));
            }
        },
        string: {
            method: 'get',
            path: '/string',
            action: 'foo'
        },
        post: {
            method: 'post',
            path: '/post',
            action: function (context, payload, done) {
                done();
            }
        }
    };
    var fooAction = function (context, payload, done) {
        done();
    };

    beforeEach(function () {
        mockContext = createMockActionContext({
            stores: [RouteStore]
        });
        mockContext.dispatcherContext.dispatch('RECEIVE_ROUTES', routes);
        mockContext.getAction = function (actionName, foo) {
            if ('foo' === actionName) {
                return fooAction;
            }
        };
    });

    it ('should dispatch on route match', function (done) {
        navigateAction(mockContext, {
            url: '/'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0].name).to.equal('NAVIGATE_START');
            expect(mockContext.dispatchCalls[0].payload.url).to.equal('/');
            expect(mockContext.dispatchCalls[1].name).to.equal('NAVIGATE_SUCCESS');
            expect(mockContext.dispatchCalls[1].payload.url).to.equal('/');
            done();
        });
    });

    it ('should include query param on route match', function (done) {
        var url = '/?foo=bar&a=b&a=c&bool#abcd=fff';
        navigateAction(mockContext, {
            url: url
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0].name).to.equal('NAVIGATE_START');
            var route = mockContext.getStore('RouteStore').getCurrentRoute();
            expect(route.toJS().query).to.eql({foo: 'bar', a: ['b', 'c'], bool: null}, 'query added to route payload for NAVIGATE_START' + JSON.stringify(route));
            expect(mockContext.dispatchCalls[1].name).to.equal('NAVIGATE_SUCCESS');
            route = mockContext.dispatchCalls[1].payload;
            expect(route.url).to.equal(url);
            done();
        });
    });

    it ('should not call execute action if there is no action', function (done) {
        navigateAction(mockContext, {
            url: '/'
        }, function () {
            expect(mockContext.executeActionCalls.length).to.equal(0);
            done();
        });
    });

    it ('should call execute action if there is an action', function (done) {
        navigateAction(mockContext, {
            url: '/action'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[1].name).to.equal('NAVIGATE_SUCCESS');
            expect(mockContext.dispatchCalls[1].payload.url).to.equal('/action');
            expect(mockContext.executeActionCalls.length).to.equal(1);
            expect(mockContext.executeActionCalls[0].action).to.equal(routes.action.action);
            expect(mockContext.executeActionCalls[0].payload.get('url')).to.equal('/action');
            done();
        });
    });

    it ('should call execute action if there is an action as a string', function (done) {
        navigateAction(mockContext, {
            url: '/string'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[1].name).to.equal('NAVIGATE_SUCCESS');
            expect(mockContext.dispatchCalls[1].payload.url).to.equal('/string');
            expect(mockContext.executeActionCalls.length).to.equal(1);
            expect(mockContext.executeActionCalls[0].action).to.equal(fooAction);
            expect(mockContext.executeActionCalls[0].payload.get('url')).to.equal('/string');
            done();
        });
    });

    it ('should dispatch failure if action failed', function (done) {
        navigateAction(mockContext, {
            url: '/fail'
        }, function (err) {
            expect(err).to.be.an('object');
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[1].name).to.equal('NAVIGATE_FAILURE');
            expect(mockContext.dispatchCalls[1].payload.url).to.equal('/fail');
            done();
        });
    });

    it ('should call back with a 404 error if route not found', function (done) {
        navigateAction(mockContext, {
            url: '/404'
        }, function (err) {
            expect(err).to.be.an('object');
            expect(err.statusCode).to.equal(404);
            done();
        });
    });

    it ('should call back with a 404 error if url matches but not method', function (done) {
        navigateAction(mockContext, {
            url: '/post',
            method: 'get'
        }, function (err) {
            expect(err).to.be.an('object');
            expect(err.statusCode).to.equal(404);
            done();
        });
    });

    it ('should dispatch if both url and method matches', function (done) {
        navigateAction(mockContext, {
            url: '/post',
            method: 'post'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0].name).to.equal('NAVIGATE_START');
            expect(mockContext.dispatchCalls[0].payload.url).to.equal('/post');
            expect(mockContext.dispatchCalls[1].name).to.equal('NAVIGATE_SUCCESS');
            expect(mockContext.dispatchCalls[1].payload.url).to.equal('/post');
            done();
        });
    });

    it ('should error if routeStore does not exist', function (done) {
        function BadRouteStore(){}
        BadRouteStore.storeName = 'RouteStore';

        var newMockContext = createMockActionContext({
            stores: [BadRouteStore]
        });
        newMockContext.dispatcherContext.dispatch('RECEIVE_ROUTES', routes);
        navigateAction(newMockContext, {
            url: '/action',
            method: 'get'
        }, function (err) {
            expect(err).to.be.an('object');
            expect(err.message).to.equal('RouteStore has not implemented `getCurrentRoute` method.');
            done();
        });
    });
});
