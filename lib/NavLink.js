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
    propTypes: {
      context: React.PropTypes.object.isRequired
    },
    dispatchNavAction: function (e) {
        var context = this.props.context;
        debug('dispatchNavAction: action=NAVIGATE path=' + this.props.href + ' params=' + JSON.stringify(this.props.navParams));
        if (context) {
            e.preventDefault();
            e.stopPropagation();
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
        var context = this.props.context,
            routeName = this.props.routeName;
        if (!this.props.href && routeName && context && context.makePath) {
            this.props.href = context.makePath(routeName, this.props.navParams);
        }
        return React.DOM.a(
                {onClick:this.dispatchNavAction, href:this.props.href},
                this.props.children
            );        
    }
});

module.exports = NavLink;
