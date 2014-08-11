/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react/addons'),
    NavLink,
    navigateAction = require('../actions/navigate'),
    debug = require('debug')('NavLink');

NavLink = React.createClass({
    dispatchNavAction: function (e) {
        var context = this.props.context;
        debug('dispatchNavAction: action=NAVIGATE path=' + this.props.href + ' params=' + JSON.stringify(this.props.navParams));
        if (context) {
            e.preventDefault();
            context.executeAction(navigateAction, {
                type: 'click',
                path: this.props.href,
                params: this.props.navParams
            });
        } else {
            console.warn('NavLink.dispatchNavAction: missing dispatcher, will load from server');
        }
    },
    render: function() {
        var context = this.props.context;
        if (!this.props.href && this.props.name && context && context.makePath) {
            this.props.href = context.makePath(this.props.name, this.props.navParams);
        }
        return this.transferPropsTo(
            React.DOM.a(
                {onClick:this.dispatchNavAction, href:this.props.href},
                this.props.children
            )
        );
    }
});

module.exports = NavLink;
