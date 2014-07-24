/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var expect = require('chai').expect,
    routerMixin,
    dispatcherMock,
    pushStateMock,
    jsdom = require('jsdom'),
    testResult;

dispatcherMock = {
    dispatch: function (action, payload) {
        testResult.dispatch = {
            action: action,
            payload: payload
        };
    }
};

pushStateMock = function (state, title, url) {
    testResult.pushState = {
        state: state,
        title: title,
        url: url
    };
};

beforeEach(function () {
    routerMixin = require('../../lib/RouterMixin');
    routerMixin.props = {dispatcher: dispatcherMock};
    global.window = jsdom.jsdom().createWindow('<html><body></body></html>');
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
        expect(routerMixin._routerPopstateListener).to.be.a('function');
        window.dispatchEvent({_type: 'popstate', state: {a: 1}});
        expect(testResult.dispatch.action).to.equal('NAVIGATE');
        expect(testResult.dispatch.payload.type).to.equal('popstate');
        expect(testResult.dispatch.payload.path).to.equal(window.location.pathname);
        expect(testResult.dispatch.payload.params).to.eql({a: 1});
    });
});

describe('componentWillUnmount()', function () {
    it ('stop listening to popstate event', function () {
        routerMixin.componentDidMount();
        expect(routerMixin._routerPopstateListener).to.be.a('function');
        routerMixin.componentWillUnmount();
        expect(routerMixin._routerPopstateListener).to.equal(null);
        window.dispatchEvent({_type: 'popstate', state: {a: 1}});
        expect(testResult.dispatch).to.equal(undefined);
    });
});

describe('componentDidUpdate()', function () {
    it ('no-op on same route', function () {
        var prevRoute = {path: '/foo'},
            newRoute = {path: '/foo'};
        var origPushState = window.history.pushState;
        window.history.pushState = pushStateMock;
        routerMixin.state = {route: newRoute};
        routerMixin.componentDidMount();
        routerMixin.componentDidUpdate({}, {route: prevRoute});
        expect(testResult.pushState).to.equal(undefined);
        window.history.pushState = origPushState;
    });
    it ('do not pushState, navigateType=popstate', function () {
        var oldRoute = {path: '/foo'},
            newRoute = {path: '/bar'};
        var origPushState = window.history.pushState;
        window.history.pushState = pushStateMock;
        routerMixin.state = {route: newRoute, navigateType: 'popstate'};
        routerMixin.componentDidMount();
        routerMixin.componentDidUpdate({},  {route: oldRoute});
        expect(testResult.pushState).to.equal(undefined);
        window.history.pushState = origPushState;
    });
    it ('update with different route, navigateType=click', function () {
        var oldRoute = {path: '/foo'},
            newRoute = {path: '/bar'};
        var origPushState = window.history.pushState;
        window.history.pushState = pushStateMock;
        routerMixin.state = {route: newRoute};
        routerMixin.componentDidMount();
        routerMixin.componentDidUpdate({},  {route: oldRoute, navigateType: 'click'});
        expect(testResult.pushState).to.eql({state: null, title: null, url: '/bar'});
        window.history.pushState = origPushState;
    });
});
