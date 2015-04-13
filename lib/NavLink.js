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
        followLink: React.PropTypes.bool,
        preserveScrollPosition: React.PropTypes.bool
    },
    getInitialState: function () {
        return {
            href: this._getHrefFromProps(this.props)
        };
    },
    componentWillReceiveProps: function (nextProps) {
        this.setState({
            href: this._getHrefFromProps(nextProps)
        });
    },
    _getHrefFromProps: function (props) {
        var href = props.href;
        var routeName = props.routeName;
        if (!href && routeName) {
            var context = props.context || this.context;
            href = context.makePath(routeName, props.navParams);
        }
        if (!href) {
            throw new Error('NavLink created without href or unresolvable routeName \'' + routeName + '\'');
        }
        return href;
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

        var href = this.state.href;

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

        var context = this.props.context || this.context;
        if (!context || !context.executeAction) {
            console.warn('NavLink does not have access to executeAction. Link using browser default.');
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        context.executeAction(navigateAction, {
            type: 'click',
            url: href,
            preserveScrollPosition: this.props.preserveScrollPosition,
            params: this.props.navParams
        });
    },
    render: function() {
        return React.createElement(
            'a',
            objectAssign({}, {
                onClick: this.dispatchNavAction
            }, this.props, {
                href: this.state.href
            }),
            this.props.children
        );
    }
});

module.exports = NavLink;
