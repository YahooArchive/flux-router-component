/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react/addons'),
    NavLink,
    ACTION_NAVIGATE = 'NAVIGATE',
    debug = require('debug')('NavLink');

NavLink = React.createClass({
    dispatchNavAction: function (e) {
        var dispatcher = this.props.dispatcher;
        debug('dispatchNavAction: action=NAVIGATE path=' + this.props.href + ' params=' + JSON.stringify(this.props.navParams));
        if (dispatcher) {
            e.preventDefault();
            dispatcher.dispatch(ACTION_NAVIGATE, {
                path: this.props.href,
                params: this.props.navParams
            });
        } else {
            console.warn('NavLink.dispatchNavAction: missing dispatcher, will load from server');
        }
    },
    render: function() {
        var router = this.props.router;
        if (!this.props.href && this.props.name && router) {
            this.props.href = router.makePath(this.props.name, this.props.navParams);
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
