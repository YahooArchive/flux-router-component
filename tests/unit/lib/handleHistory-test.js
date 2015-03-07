/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var mockery = require('mockery');
var expect = require('chai').expect;
var jsdom = require('jsdom');
var React;
var MockAppComponent;
var RouteStore = require('../../../lib/RouteStore');
var createMockComponentContext = require('fluxible/utils/createMockComponentContext');
var ReactTestUtils;

var TestRouteStore = RouteStore.withStaticRoutes({
    foo: { path: '/foo', method: 'get' },
    fooA: { path: '/foo/:a', method: 'get' },
    fooAB: { path: '/foo/:a/:b', method: 'get' },
    pathFromHistory: { path: '/the_path_from_history', method: 'get' }
});

var testResult = {};
var historyMock = function (url, state) {
    return {
        getUrl: function () {
            return url || '/the_path_from_history';
        },
        getState: function () {
            return state;
        },
        on: function (listener) {
            testResult.historyMockOn = listener;
        },
        off: function () {
            testResult.historyMockOn = null;
        },
        pushState: function (state, title, url) {
            testResult.pushState = {
                state: state,
                title: title,
                url: url
            };
        },
        replaceState: function (state, title, url) {
            testResult.replaceState = {
                state: state,
                title: title,
                url: url
            };
        }
    };
};

var scrollToMock = function (x, y) {
    testResult.scrollTo = {x: x, y: y};
};

describe ('handleHistory', function () {
    var mockContext;
    var provideContext;
    var handleHistory;

    beforeEach(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
        global.document = jsdom.jsdom('<html><body></body></html>');
        global.window = global.document.parentWindow;
        global.navigator = global.window.navigator;
        global.window.scrollTo = scrollToMock;
        React = require('react');
        provideContext = require('fluxible/addons/provideContext');
        handleHistory = require('../../../').handleHistory;
        MockAppComponent = require('../../mocks/MockAppComponent').UnwrappedMockAppComponent;
        ReactTestUtils = React.addons.TestUtils;
        mockContext = createMockComponentContext({
            stores: [TestRouteStore]
        });
        testResult = {};
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
        mockery.disable();
    });

    describe('render', function () {
        it('should pass the currentRoute as prop to child', function () {
            var rendered = false;
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            var Child = React.createClass({
                displayName: 'Child',
                render: function () {
                    rendered = true;
                    expect(this.props.currentRoute).to.be.an('object');
                    expect(this.props.currentRoute.get('url')).to.equal('/foo');
                    return null;
                }
            });
            MockAppComponent = provideContext(handleHistory(MockAppComponent));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <Child />
                </MockAppComponent>
            );
            expect(rendered).to.equal(true);
        });
    });

    describe('componentDidMount()', function () {
        it ('listen to popstate event', function () {
            MockAppComponent = provideContext(handleHistory(MockAppComponent));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            window.dispatchEvent({_type: 'popstate', state: {params: {a: 1}}});
            expect(mockContext.executeActionCalls.length).to.equal(1);
            expect(mockContext.executeActionCalls[0].action).to.be.a('function');
            expect(mockContext.executeActionCalls[0].payload.type).to.equal('popstate');
            expect(mockContext.executeActionCalls[0].payload.url).to.equal(window.location.pathname);
            expect(mockContext.executeActionCalls[0].payload.params).to.deep.equal({a: 1});
        });
        it ('listen to scroll event', function (done) {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/the_path_from_state', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                historyCreator: function () {
                    return historyMock();
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            window.dispatchEvent({_type: 'scroll'});
            window.dispatchEvent({_type: 'scroll'});
            window.setTimeout(function() {
                expect(testResult.replaceState).to.eql({state: {scroll: {x: 0, y: 0}}, title: undefined, url: undefined});
                done();
            }, 150);
        });
        it ('dispatch navigate event for pages that url does not match', function (done) {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/the_path_from_state', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                checkRouteOnPageLoad: true,
                historyCreator: function () {
                    return historyMock();
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            window.setTimeout(function() {
                expect(mockContext.executeActionCalls.length).to.equal(1);
                expect(mockContext.executeActionCalls[0].action).to.be.a('function');
                expect(mockContext.executeActionCalls[0].payload.type).to.equal('pageload');
                expect(mockContext.executeActionCalls[0].payload.url).to.equal('/the_path_from_history');
                done();
            }, 150);
        });
        it ('does not dispatch navigate event for pages with matching url', function (done) {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/the_path_from_history', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                historyCreator: function () {
                    return historyMock('/foo');
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            window.setTimeout(function() {
                expect(testResult.dispatch).to.equal(undefined, JSON.stringify(testResult.dispatch));
                done();
            }, 10);
        });
    });

    describe('componentWillUnmount()', function () {
        it ('stop listening to popstate event', function () {
            var div = document.createElement('div');
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                historyCreator: function () {
                    return historyMock('/foo');
                }
            }));
            React.render(
                <MockAppComponent context={mockContext} />
            , div);
            React.unmountComponentAtNode(div);
            expect(testResult.historyMockOn).to.equal(null);
            window.dispatchEvent({_type: 'popstate', state: {params: {a: 1}}});
            expect(testResult.dispatch).to.equal(undefined);
        });
    });

    describe('componentDidUpdate()', function () {
        it ('no-op on same route', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                historyCreator: function () {
                    return historyMock('/foo');
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            expect(testResult.pushState).to.equal(undefined);
        });
        it ('do not pushState, navigate.type=popstate', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                historyCreator: function () {
                    return historyMock('/foo');
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            routeStore.handleNavigateStart({url: '/bar', type: 'popstate', method: 'GET'});
            expect(testResult.pushState).to.equal(undefined);
        });
        it ('update with different route, navigate.type=click, reset scroll position', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                historyCreator: function () {
                    return historyMock('/foo');
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET'});
            expect(testResult.pushState).to.eql({state: {params: {}, scroll: {x: 0, y: 0}}, title: null, url: '/bar'});
            expect(testResult.scrollTo).to.eql({x: 0, y: 0});
        });
        it ('update with different route, navigate.type=click, enableScroll=false, do not reset scroll position', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                enableScroll: false,
                historyCreator: function () {
                    return historyMock('/foo');
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET'});
            expect(testResult.pushState).to.eql({state: {params: {}}, title: null, url: '/bar'});
            expect(testResult.scrollTo).to.equal(undefined);
        });
        it ('update with different route, navigate.type=replacestate, enableScroll=false, do not reset scroll position', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                enableScroll: false,
                historyCreator: function () {
                    return historyMock('/foo');
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET', type: 'replacestate'});
            expect(testResult.replaceState).to.eql({state: {params: {}}, title: null, url: '/bar'});
            expect(testResult.scrollTo).to.equal(undefined);
        });
        it ('update with different route, navigate.type=default, reset scroll position', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                historyCreator: function () {
                    return historyMock('/foo');
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET'});
            expect(testResult.pushState).to.eql({state: {params: {}, scroll: {x: 0, y: 0} }, title: null, url: '/bar'});
            expect(testResult.scrollTo).to.eql({x: 0, y: 0});
        });
        it ('update with different route, navigate.type=default, enableScroll=false, do not reset scroll position', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                enableScroll: false,
                historyCreator: function () {
                    return historyMock('/foo', {scroll: {x: 12, y: 200}});
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET'});
            expect(testResult.pushState).to.eql({state: {params: {}}, title: null, url: '/bar'});
            expect(testResult.scrollTo).to.equal(undefined);
        });
        it ('do not pushState, navigate.type=popstate, restore scroll position', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                historyCreator: function () {
                    return historyMock('/foo#hash1', {scroll: {x: 12, y: 200}});
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET', type: 'popstate'});
            expect(testResult.pushState).to.equal(undefined);
            expect(testResult.scrollTo).to.eql({x: 12, y: 200});
        });
        it ('do not pushState, navigate.type=popstate, enableScroll=false, restore scroll position', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                enableScroll: false,
                historyCreator: function () {
                    return historyMock('/foo#hash1', {scroll: {x: 12, y: 200}});
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET', type: 'popstate'});
            expect(testResult.pushState).to.equal(undefined);
            expect(testResult.scrollTo).to.eql(undefined);

        });
        it ('update with different route, navigate.type=click, with params', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                historyCreator: function () {
                    return historyMock('/foo#hash1');
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            routeStore.handleNavigateStart({url: '/bar', type: 'click', params: {foo: 'bar'}});
            expect(testResult.pushState).to.eql({state: {params: {foo: 'bar'}, scroll: {x: 0, y:0}}, title: null, url: '/bar'});
        });
        it ('update with same path and different hash, navigate.type=click, with params', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo#hash1', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                historyCreator: function () {
                    return historyMock('/foo#hash1');
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            routeStore.handleNavigateStart({url: '/foo#hash2', type: 'click', params: {foo: 'bar'}});
            expect(testResult.pushState).to.eql({state: {params: {foo: 'bar'}, scroll: {x: 0, y:0}}, title: null, url: '/foo#hash2'});
        });
        it ('update with different route, navigate.type=replacestate, with params', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                historyCreator: function () {
                    return historyMock('/foo');
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET', type: 'replacestate', params: {foo: 'bar'}});
            expect(testResult.replaceState).to.eql({state: {params: {foo: 'bar'}, scroll: {x: 0, y: 0}}, title: null, url: '/bar'});
        });
        it ('update with different route, navigate.type=replacestate', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                historyCreator: function () {
                    return historyMock('/foo', {scroll: {x: 42, y: 3}});
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET', type: 'replacestate'});
            expect(testResult.replaceState).to.eql({state: {params: {}, scroll: {x: 0, y: 0}}, title: null, url: '/bar'});
        });
        it ('update with different route, navigate.type=pushstate, preserve scroll state', function () {
            global.window.scrollX = 42;
            global.window.scrollY = 3;
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                historyCreator: function () {
                    return historyMock('/foo');
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET', type: 'click', preserveScrollPosition: true});
            expect(testResult.pushState).to.eql({state: {params: {}, scroll: {x: 42, y: 3}}, title: null, url: '/bar'});
        });
        it ('update with different route, navigate.type=replacestate, preserve scroll state', function () {
            global.window.scrollX = 42;
            global.window.scrollY = 3;
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            MockAppComponent = provideContext(handleHistory(MockAppComponent, {
                historyCreator: function () {
                    return historyMock('/foo');
                }
            }));
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} />
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET', type: 'replacestate', preserveScrollPosition: true});
            expect(testResult.replaceState).to.eql({state: {params: {}, scroll: {x: 42, y: 3}}, title: null, url: '/bar'});
        });
    });

});
