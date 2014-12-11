/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var expect = require('chai').expect,
    routerMixin,
    contextMock,
    historyMock,
    jsdom = require('jsdom'),
    lodash = require('lodash'),
    testResult;

contextMock = {
    executeAction: function (action, payload) {
        testResult.dispatch = {
            action: action,
            payload: payload
        };
    }
};

historyMock = function (url) {
    return {
        getUrl: function () {
            return url || '/the_path_from_history';
        },
        on: function (listener) {
            testResult.historyMockOn = listener;
        },
        pushState: function (state, title, url) {
            testResult.pushState = {
                state: state,
                title: title,
                url: url
            };
        }
    };
};

describe ('RouterMixin', function () {

    beforeEach(function () {
        routerMixin = require('../../../lib/RouterMixin');
        routerMixin.props = {context: contextMock};
        routerMixin.state = {
            route: {}
        };
        global.window = jsdom.jsdom('<html><body></body></html>').defaultView;
        global.document = global.window.document;
        global.navigator = global.window.navigator;
        testResult = {};
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
    });

    describe('componentDidMount()', function () {
        it ('listen to popstate event', function () {
            routerMixin.componentDidMount();
            expect(routerMixin._historyListener).to.be.a('function');
            window.dispatchEvent({_type: 'popstate', state: {a: 1}});
            expect(testResult.dispatch.action).to.be.a('function');
            expect(testResult.dispatch.payload.type).to.equal('popstate');
            expect(testResult.dispatch.payload.url).to.equal(window.location.pathname);
            expect(testResult.dispatch.payload.params).to.eql({a: 1});
        });
        it ('dispatch navigate event for pages that url does not match', function (done) {
            routerMixin.props = {context: contextMock, checkRouteOnPageLoad: true, historyCreator: function() { return historyMock(); }};
            var origPushState = window.history.pushState;
            routerMixin.state = {
                route: {
                    url: '/the_path_from_state'
                }
            };
            routerMixin.componentDidMount();
            window.setTimeout(function() {
                expect(testResult.dispatch.action).to.be.a('function');
                expect(testResult.dispatch.payload.type).to.equal('pageload');
                expect(testResult.dispatch.payload.url).to.equal('/the_path_from_history');
                done();
            }, 10);
        });
        it ('does not dispatch navigate event for pages with matching url', function (done) {
            routerMixin.props = {context: contextMock, historyCreator: function() { return historyMock(); }};
            var origPushState = window.history.pushState;
            routerMixin.state = {
                route: {
                    url: '/the_path_from_history'
                }
            };
            routerMixin.componentDidMount();
            window.setTimeout(function() {
                expect(testResult.dispatch).to.equal(undefined, JSON.stringify(testResult.dispatch));
                done();
            }, 10);
        });
    });

    describe('componentWillUnmount()', function () {
        it ('stop listening to popstate event', function () {
            routerMixin.componentDidMount();
            expect(routerMixin._historyListener).to.be.a('function');
            routerMixin.componentWillUnmount();
            expect(routerMixin._historyListener).to.equal(null);
            window.dispatchEvent({_type: 'popstate', state: {a: 1}});
            expect(testResult.dispatch).to.equal(undefined);
        });
    });

    describe('componentDidUpdate()', function () {
        it ('no-op on same route', function () {
            var prevRoute = {url: '/foo'},
                newRoute = {url: '/foo'};
            routerMixin.props = {context: contextMock, historyCreator: function() { return historyMock('/foo'); }};
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({}, {route: prevRoute});
            expect(testResult.pushState).to.equal(undefined);
        });
        it ('do not pushState, navigate.type=popstate', function () {
            var oldRoute = {url: '/foo'},
                newRoute = {url: '/bar', navigate: {type: 'popstate'}};
            routerMixin.props = {context: contextMock, historyCreator: function() { return historyMock('/foo'); }};
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.equal(undefined);
        });
        it ('update with different route, navigate.type=click', function () {
            var oldRoute = {url: '/foo'},
                newRoute = {url: '/bar', navigate: {type: 'click'}};
            routerMixin.props = {context: contextMock, historyCreator: function() { return historyMock('/foo'); }};
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.eql({state: null, title: null, url: '/bar'});
        });
        it ('do not pushState, navigate.type=popstate', function () {
            var oldRoute = {url: '/foo'},
                newRoute = {url: '/bar', navigate: {type: 'popstate'}};
            routerMixin.props = {context: contextMock, historyCreator: function() { return historyMock('/foo'); }};
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.equal(undefined);
        });
        it ('update with different route, navigate.type=click, with params', function () {
            var oldRoute = {url: '/foo'},
                newRoute = {url: '/bar', navigate: {type: 'click', params: {foo: 'bar'}}};
            routerMixin.props = {context: contextMock, historyCreator: function() { return historyMock('/foo'); }};
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.eql({state: {foo: 'bar'}, title: null, url: '/bar'});
        });
        it ('update with same path and different hash, navigate.type=click, with params', function () {
            var oldRoute = {url: '/foo#hash1'},
                newRoute = {url: '/foo#hash2', navigate: {type: 'click', params: {foo: 'bar'}}};
            routerMixin.props = {context: contextMock, historyCreator: function() { return historyMock('/foo#hash1'); }};
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.eql({state: {foo: 'bar'}, title: null, url: '/foo#hash2'});
        });
    });

});
