/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,beforeEach */
"use strict";

var expect = require('chai').expect;
var routrPlugin = require('../../../').plugin;
var FluxibleApp = require('fluxible-app');

describe('RouterPlugin', function () {
    var app,
        pluginInstance,
        context,
        routes = {
            view_user: {
                path: '/user/:id',
                method: 'get',
                foo: {
                    bar: 'baz'
                }
            },
            view_user_post: {
                path: '/user/:id/post/:post',
                method: 'get'
            }
        };

    beforeEach(function () {
        app = new FluxibleApp();
        pluginInstance = routrPlugin({
            routes: routes
        });
        app.plug(pluginInstance);
        context = app.createContext();
    });

    describe('factory', function () {
        it('should accept routes option', function () {
            expect(pluginInstance.getRoutes()).to.deep.equal(routes);
        });
    });

    describe('actionContext', function () {
        var actionContext;
        beforeEach(function () {
            actionContext = context.getActionContext();
        });
        describe('router', function () {
            it('should have a router access', function () {
                expect(actionContext.router).to.be.an('object');
                expect(actionContext.router.makePath).to.be.a('function');
                expect(actionContext.router.getRoute).to.be.a('function');
                expect(actionContext.router.makePath('view_user', {id: 1})).to.equal('/user/1');
            });
        });
    });

    describe('componentContext', function () {
        var componentContext;
        beforeEach(function () {
            componentContext = context.getComponentContext();
        });
        describe('router', function () {
            it('should have a router access', function () {
                expect(componentContext.makePath).to.be.a('function');
                expect(componentContext.makePath('view_user', {id: 1})).to.equal('/user/1');
            });
        });
    });

});
