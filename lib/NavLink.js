/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react/addons');
var NavLink;
var navigateAction = require('../actions/navigate');
var debug = require('debug')('NavLink');
var objectAssign = require('object-assign');

NavLink = React.createClass({
    displayName: 'NavLink',
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
        console.log('....... this.props=', this.props);
        return React.createElement(
                'a',
                objectAssign({}, {
                    onClick: this.dispatchNavAction
                }, this.props),
                this.props.children
            );
    }
});

module.exports = NavLink;
