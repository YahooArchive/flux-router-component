var expect = require('chai').expect;
var RouteStore = require('../../../').RouteStore;
var StaticRouteStore = RouteStore.withStaticRoutes({
    foo: {
        path: '/foo',
        method: 'get'
    }
});

describe('RouteStore', function () {

    describe('withStaticRoutes', function () {
        var routeStore;
        beforeEach(function () {
            routeStore = new StaticRouteStore();
            routeStore.handleNavigateStart({
                url: '/foo',
                method: 'get'
            });
        });
        describe('dehydrate', function () {
            it('should dehydrate correctly', function () {
                var state = routeStore.dehydrate();
                expect(state).to.be.an('object');
                expect(state.currentUrl).to.equal('/foo');
                expect(state.currentNavigate).to.deep.equal({
                    url: '/foo',
                    method: 'get'
                });
                expect(state.routes).to.equal(null);
            });
        });
        describe('rehydrate', function () {
            it('should rehydrate correctly', function () {
                var newStore = new StaticRouteStore();
                newStore.rehydrate({
                    currentUrl: '/foo',
                    currentNavigate: { url: '/foo', method: 'get' },
                    routes: null
                });
                expect(newStore.getCurrentRoute()).to.be.an('object');
                expect(newStore.getCurrentNavigate()).to.deep.equal({
                    url: '/foo',
                    method: 'get'
                });
                expect(newStore.routes).to.equal(null);
            });
        });
    });

    describe('withoutStaticRoutes', function () {
        var routeStore;
        var routes = {
            foo: {
                path: '/foo',
                method: 'get'
            }
        };
        beforeEach(function () {
            routeStore = new RouteStore();
            routeStore.handleReceiveRoutes(routes);
            routeStore.handleNavigateStart({
                url: '/foo',
                method: 'get'
            });
        });
        describe('dehydrate', function () {
            it('should dehydrate correctly', function () {
                var state = routeStore.dehydrate();
                expect(state).to.be.an('object');
                expect(state.currentUrl).to.equal('/foo');
                expect(state.currentNavigate).to.deep.equal({
                    url: '/foo',
                    method: 'get'
                });
                expect(state.routes).to.deep.equal(routes);
            });
        });
        describe('rehydrate', function () {
            it('should rehydrate correctly', function () {
                var newStore = new StaticRouteStore();
                newStore.rehydrate({
                    currentUrl: '/foo',
                    currentNavigate: { url: '/foo', method: 'get' },
                    routes: routes
                });
                expect(newStore.getCurrentRoute()).to.be.an('object');
                expect(newStore.getCurrentNavigate()).to.deep.equal({
                    url: '/foo',
                    method: 'get'
                });
                expect(newStore.routes).to.deep.equal(routes);
            });
        });
    });

});
