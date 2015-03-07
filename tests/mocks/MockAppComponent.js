/**
 * Copyright 2014-2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react/addons');
var provideContext = require('fluxible/addons/provideContext');
var handleHistory = require('../../lib/handleHistory');

var MockAppComponent = React.createClass({
    contextTypes: {
        getStore: React.PropTypes.func.isRequired
    },
    render: function () {
        if (!this.props.children) {
            return null;
        }
        return React.addons.cloneWithProps(this.props.children, {
            currentRoute: this.props.currentRoute
        });
    }
});

module.exports = provideContext(handleHistory(MockAppComponent, {
    checkRouteOnPageLoad: false,
    enableScroll: true
}));
module.exports.UnwrappedMockAppComponent = MockAppComponent;
