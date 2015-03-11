var React = require('react/addons');
var RouterMixin = require('../../').RouterMixin;

var MockAppComponent = React.createClass({

    mixins: [RouterMixin],

    childContextTypes: {
        executeAction: React.PropTypes.func,
        getStore: React.PropTypes.func
    },
    getChildContext: function () {
        return {
            executeAction: this.props.context.executeAction,
            getStore: this.props.context.getStore
        };
    },

    render: function () {
        return React.addons.cloneWithProps(this.props.children, {});
    }
});

module.exports = MockAppComponent;
