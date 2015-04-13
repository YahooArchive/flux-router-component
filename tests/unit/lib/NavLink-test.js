/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var React;
var NavLink;
var ReactTestUtils;
var jsdom = require('jsdom');
var expect = require('chai').expect;
var contextMock;
var onClickMock;
var routerMock;
var testResult;

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
        global.document = jsdom.jsdom('<html><body></body></html>');
        global.window = global.document.parentWindow;
        global.navigator = global.window.navigator;
        React = require('react/addons');
        ReactTestUtils = React.addons.TestUtils;
        NavLink = React.createFactory(require('../../../lib/NavLink'));
        Wrapper = React.createFactory(require('../../mocks/MockAppComponent'));
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
            var navParams = {a: 1, b: 2};
            var link = React.renderToString(NavLink( {routeName:"foo", navParams:navParams, context:contextMock}, React.DOM.span(null, "bar")));
            expect(link).to.contain('href="/foo/a/1/b/2"');
        });
        it ('only routeName defined; use this.context.makePath', function (done) {
            var navParams = {a: 1, b: 2};
            var link = React.renderToString(Wrapper({
                context: contextMock
            }, NavLink({routeName:"foo", navParams:navParams})));
            expect(link).to.contain('href="/foo/a/1/b/2"');
            done();
        });
        it ('none defined', function () {
            var navParams = {a: 1, b: 2};
            expect(function () {
                ReactTestUtils.renderIntoDocument(NavLink( {navParams:navParams, context:contextMock}, React.DOM.span(null, "bar")));
            }).to.throw();
        });
    });

    describe('dispatchNavAction()', function () {
        it ('use react context', function (done) {
            var navParams = {a: 1, b: true};
            var link = ReactTestUtils.renderIntoDocument(NavLink({
                href:"/foo",
                preserveScrollPosition: true,
                navParams: navParams
            }, React.DOM.span(null, "bar")));
            link.context = contextMock;
            ReactTestUtils.Simulate.click(link.getDOMNode(), {button: 0});
            window.setTimeout(function () {
                expect(testResult.dispatch.action).to.equal('NAVIGATE');
                expect(testResult.dispatch.payload.type).to.equal('click');
                expect(testResult.dispatch.payload.url).to.equal('/foo');
                expect(testResult.dispatch.payload.preserveScrollPosition).to.equal(true);
                expect(testResult.dispatch.payload.params).to.eql({a: 1, b: true});
                done();
            }, 10);
        });
        it ('context.executeAction called for relative urls', function (done) {
            var navParams = {a: 1, b: true};
            var link = ReactTestUtils.renderIntoDocument(NavLink( {href:"/foo", navParams:navParams}, React.DOM.span(null, "bar")));
            link.context = contextMock;
            ReactTestUtils.Simulate.click(link.getDOMNode(), {button: 0});
            window.setTimeout(function () {
                expect(testResult.dispatch.action).to.equal('NAVIGATE');
                expect(testResult.dispatch.payload.type).to.equal('click');
                expect(testResult.dispatch.payload.url).to.equal('/foo');
                expect(testResult.dispatch.payload.params).to.eql({a: 1, b: true});
                done();
            }, 10);
        });
        it ('context.executeAction called for routeNames', function (done) {
            var link = ReactTestUtils.renderIntoDocument(NavLink( {routeName:"foo", context: contextMock}, React.DOM.span(null, "bar")));
            link.context = contextMock;
            ReactTestUtils.Simulate.click(link.getDOMNode(), {button: 0});
            window.setTimeout(function () {
                expect(testResult.dispatch.action).to.equal('NAVIGATE');
                expect(testResult.dispatch.payload.type).to.equal('click');
                expect(testResult.dispatch.payload.url).to.equal('/foo');
                done();
            }, 10);
        });
        it ('context.executeAction called for absolute urls from same origin', function (done) {
            var navParams = {a: 1, b: true};
            var origin = window.location.origin;
            var link = ReactTestUtils.renderIntoDocument(NavLink( {href: origin + "/foo?x=y", navParams:navParams}, React.DOM.span(null, "bar")));
            link.context = contextMock;
            ReactTestUtils.Simulate.click(link.getDOMNode(), {button: 0});
            window.setTimeout(function () {
                expect(testResult.dispatch.action).to.equal('NAVIGATE');
                expect(testResult.dispatch.payload.type).to.equal('click');
                expect(testResult.dispatch.payload.url).to.equal('/foo?x=y');
                expect(testResult.dispatch.payload.params).to.eql({a: 1, b: true});
                done();
            }, 10);
        });
        it ('context.executeAction not called if context does not exist', function (done) {
            var navParams = {a: 1, b: true};
            var link = ReactTestUtils.renderIntoDocument(NavLink( {href:"/foo", navParams:navParams}, React.DOM.span(null, "bar")));
            ReactTestUtils.Simulate.click(link.getDOMNode(), {button: 0});
            window.setTimeout(function () {
                expect(testResult.dispatch).to.equal(undefined);
                done();
            }, 10);
        });
        it ('context.executeAction not called for external urls', function (done) {
            var navParams = {a: 1, b: true};
            var link = ReactTestUtils.renderIntoDocument(NavLink( {href:"http://domain.does.not.exist/foo", navParams:navParams}, React.DOM.span(null, "bar")));
            ReactTestUtils.Simulate.click(link.getDOMNode(), {button: 0});
            window.setTimeout(function () {
                expect(testResult.dispatch).to.equal(undefined);
                done();
            }, 10);
        });
        it ('context.executeAction not called for # urls', function (done) {
            var navParams = {a: 1, b: true};
            var link = ReactTestUtils.renderIntoDocument(NavLink( {href:"#here", navParams:navParams}, React.DOM.span(null, "bar")));
            ReactTestUtils.Simulate.click(link.getDOMNode(), {button: 0});
            window.setTimeout(function () {
                expect(testResult.dispatch).to.equal(undefined);
                done();
            }, 10);
        });
        it ('context.executeAction not called if followLink=true', function (done) {
            var navParams = {a: 1, b: true};
            var link = ReactTestUtils.renderIntoDocument(NavLink( {href:"/somepath", navParams:navParams, followLink:true}, React.DOM.span(null, "bar")));
            link.context = contextMock;
            ReactTestUtils.Simulate.click(link.getDOMNode(), {button: 0});
            window.setTimeout(function () {
                expect(testResult.dispatch).to.equal(undefined);
                done();
            }, 1000);
        });
        it ('context.executeAction called if followLink=false', function (done) {
            var navParams = {a: 1, b: true};
            var link = ReactTestUtils.renderIntoDocument(NavLink( {href:"/foo", navParams:navParams, followLink:false}, React.DOM.span(null, "bar")));
            link.context = contextMock;
            ReactTestUtils.Simulate.click(link.getDOMNode(), {button: 0});
            window.setTimeout(function () {
                expect(testResult.dispatch.action).to.equal('NAVIGATE');
                expect(testResult.dispatch.payload.type).to.equal('click');
                expect(testResult.dispatch.payload.url).to.equal('/foo');
                expect(testResult.dispatch.payload.params).to.eql({a: 1, b: true});
                done();
            }, 10);
        });
    });

    describe('click type', function () {
        it('navigates on regular click', function (done) {
                var origin = window.location.origin;
                var link = ReactTestUtils.renderIntoDocument(NavLink( {href: origin, context:contextMock}, React.DOM.span(null, "bar")));
                ReactTestUtils.Simulate.click(link.getDOMNode(), {button: 0});
                window.setTimeout(function () {
                    expect(testResult.dispatch.action).to.equal('NAVIGATE');
                    expect(testResult.dispatch.payload.type).to.equal('click');
                    done();
                }, 10);
        });

        ['metaKey', 'altKey', 'ctrlKey', 'shiftKey'].map(function (key) {
            it('does not navigate on modified ' + key, function (done) {
                    var eventData = {button: 0};
                    eventData[key] = true;
                    var origin = window.location.origin;
                    var link = ReactTestUtils.renderIntoDocument(NavLink( {href: origin, context:contextMock}, React.DOM.span(null, "bar")));
                    ReactTestUtils.Simulate.click(link.getDOMNode(), eventData);
                    window.setTimeout(function () {
                        expect(testResult.dispatch).to.equal(undefined);
                        done();
                    }, 10);
            });
        });

    });

    it('allow overriding onClick', function (done) {
        var navParams = {a: 1, b: true};
        var link = ReactTestUtils.renderIntoDocument(NavLink( {href:"/foo", context:contextMock, navParams:navParams, onClick: onClickMock}, React.DOM.span(null, "bar")));
        expect(testResult.onClickMockInvoked).to.equal(undefined);
        ReactTestUtils.Simulate.click(link.getDOMNode(), {button: 0});
        window.setTimeout(function () {
            expect(testResult.dispatch).to.equal(undefined);
            expect(testResult.onClickMockInvoked).to.equal(true);
            done();
        }, 10);
    });
});
