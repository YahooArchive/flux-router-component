/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var React,
    NavLink,
    ReactTestUtils,
    jsdom = require('jsdom'),
    expect = require('chai').expect,
    contextMock,
    onClickMock,
    routerMock,
    testResult;

onClickMock = function () {
    testResult.onClickMockInvoked = true;
};

routerMock = {
    makePath: function (name, params) {
        var paths = ['/' + name];
        if (params) {
            Object.keys(params).sort().forEach(function (key) {
                paths.push('/' + key + '/' + params[key]);
            });
        }
        return paths.join('');
    }
};

contextMock = {
    executeAction: function (action, payload) {
        testResult.dispatch = {
            action: 'NAVIGATE',
            payload: payload
        };
    },
    makePath: routerMock.makePath.bind(routerMock)
};

describe('NavLink', function () {

    beforeEach(function () {
        global.window = jsdom.jsdom().createWindow('<html><body></body></html>');
        global.document = global.window.document;
        global.navigator = global.window.navigator;
        React = require('react/addons');
        ReactTestUtils = React.addons.TestUtils;
        NavLink = React.createFactory(require('../../../').NavLink);
        testResult = {};
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
    });

    describe('render()', function () {
        it ('href defined', function () {
            var link = ReactTestUtils.renderIntoDocument(NavLink( {href:"/foo", context:contextMock}, React.DOM.span(null, "bar")));
            expect(link.props.href).to.equal('/foo');
            expect(link.getDOMNode().textContent).to.equal('bar');
        });
        it ('both href and routeName defined', function () {
            var link = ReactTestUtils.renderIntoDocument(NavLink( {routeName:"fooo", href:"/foo", context:contextMock}, React.DOM.span(null, "bar")));
            expect(link.props.href).to.equal('/foo');
        });
        it ('only routeName defined', function () {
            var navParams = {a: 1, b: 2},
                link = ReactTestUtils.renderIntoDocument(NavLink( {routeName:"foo", navParams:navParams, context:contextMock}, React.DOM.span(null, "bar")));
            expect(link.props.href).to.equal('/foo/a/1/b/2');
        });
        it ('none defined', function () {
            var navParams = {a: 1, b: 2},
                link = ReactTestUtils.renderIntoDocument(NavLink( {navParams:navParams, context:contextMock}, React.DOM.span(null, "bar")));
            expect(link.props.href).to.equal(undefined);
        });
    });

    describe('dispatchNavAction()', function () {
        it ('context.executeAction called', function (done) {
            var navParams = {a: 1, b: true},
                link = ReactTestUtils.renderIntoDocument(NavLink( {href:"/foo", context:contextMock, navParams:navParams}, React.DOM.span(null, "bar")));
            ReactTestUtils.Simulate.click(link.getDOMNode());
            window.setTimeout(function () {
                expect(testResult.dispatch.action).to.equal('NAVIGATE');
                expect(testResult.dispatch.payload.type).to.equal('click');
                expect(testResult.dispatch.payload.path).to.equal('/foo');
                expect(testResult.dispatch.payload.params).to.eql({a: 1, b: true});
                done();
            }, 10);
        });
        it ('context.executeAction not called if context does not exist', function (done) {
            var navParams = {a: 1, b: true},
                link = ReactTestUtils.renderIntoDocument(NavLink( {href:"/foo", navParams:navParams}, React.DOM.span(null, "bar")));
            ReactTestUtils.Simulate.click(link.getDOMNode());
            window.setTimeout(function () {
                expect(testResult.dispatch).to.equal(undefined);
                done();
            }, 10);
        });
    });

    it('allow overriding onClick', function (done) {
        var navParams = {a: 1, b: true},
            link = ReactTestUtils.renderIntoDocument(NavLink( {href:"/foo", context:contextMock, navParams:navParams, onClick: onClickMock}, React.DOM.span(null, "bar")));
        expect(testResult.onClickMockInvoked).to.equal(undefined);
        ReactTestUtils.Simulate.click(link.getDOMNode());
        window.setTimeout(function () {
            expect(testResult.dispatch).to.equal(undefined);
            expect(testResult.onClickMockInvoked).to.equal(true);
            done();
        }, 10);
    });
});
