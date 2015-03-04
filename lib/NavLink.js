/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
'use strict';

var React = require('react');
var NavLink;
var navigateAction = require('../actions/navigate');
var debug = require('debug')('NavLink');
var objectAssign = require('object-assign');

function isLeftClickEvent (e) {
    return e.button === 0;
}

function isModifiedEvent (e) {
    return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}

NavLink = React.createClass({
    displayName: 'NavLink',
    contextTypes: {
        executeAction: React.PropTypes.func,
        makePath: React.PropTypes.func
    },
    propTypes: {
        context: React.PropTypes.object,
        href: React.PropTypes.string,
        routeName: React.PropTypes.string,
        navParams: React.PropTypes.object,
        followLink: React.PropTypes.bool
    },
    dispatchNavAction: function (e) {
        debug('dispatchNavAction: action=NAVIGATE', this.props.href, this.props.followLink, this.props.navParams);

        if (this.props.followLink) {
            return;
        }

        if (isModifiedEvent(e) || !isLeftClickEvent(e)) {
            // this is a click with a modifier or not a left-click
            // let browser handle it natively
            return;
        }

        var href = this.props.href;

        if (href[0] === '#') {
            // this is a hash link url for page's internal links.
            // Do not trigger navigate action. Let browser handle it natively.
            return;
        }

        if (href[0] !== '/') {
            // this is not a relative url. check for external urls.
            var location = window.location;
            var origin = location.origin || (location.protocol + '//' + location.host);

            if (href.indexOf(origin) !== 0) {
                // this is an external url, do not trigger navigate action.
                // let browser handle it natively.
                return;
            }

            href = href.substring(origin.length) || '/';
        }

        var context;
        if (this.context && this.context.executeAction) {
            context = this.context;
        } else if (this.props.context && this.props.context.executeAction) {
            context = this.props.context;
        }

        if (context) {
            e.preventDefault();
            e.stopPropagation();
            context.executeAction(navigateAction, {
                type: 'click',
                url: href,
                params: this.props.navParams
            });
        } else {
            console.warn('NavLink.dispatchNavAction: missing dispatcher, will load from server');
        }
    },
    render: function() {
        var context;
        if (this.context && this.context.makePath) {
            context = this.context;
        } else if (this.props.context && this.props.context.makePath) {
            context = this.props.context;
        }

        var routeName = this.props.routeName;
        if (!this.props.href && routeName && context) {
            this.props.href = context.makePath(routeName, this.props.navParams);
        }
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
