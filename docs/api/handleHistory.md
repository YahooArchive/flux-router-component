# API: `handleHistory`

The `handleHistory` higher-order component handles the browser history state management.

## Options

| Option | Default | Description |
|:-------|:--------|:------------|
| `checkRouteOnPageLoad` | `false` | Performs navigate on first page load |
| `enableScroll` | `true` | Saves scroll position in history state |
| `historyCreator` | [`History`](../../lib/History.js) | A factory for creating the history implementation |

## Example Usage

```js
// components/App.jsx
var provideContext = require('fluxible').provideContext;
var handleHistory = require('fluxible-router').handleHistory;
var NavLink = require('fluxible-router').NavLink;

var AppComponent = React.createClass({
    render: function () {
        // Get the handler from the current route which is passed in as prop
        var Handler = this.props.currentRoute.handler;

        return (
            <div>
                <ul>
                    // Create client handled links using NavLink anywhere in your application
                    // activeStyle will apply the styles when it's the current route
                    <li><NavLink href='/home' activeStyle={{backgroundColor: '#ccc'}}>Home</NavLink></li>
                    // RouteName will build the href from the route with the same name
                    // Active class will apply the class when it's the current route
                    <li><NavLink routeName='about' activeClass='selected'>About</NavLink></li>
                    // You can also add parameters to your route if it's a dynamic route
                    <li><NavLink routeName='user' navParams={{id: 1}}>User 1</NavLink></li>
                </ul>
                <Handler />
            </div>
        );
    }
});

// wrap with history handler
AppComponent = handleHistory(AppComponent);

// and wrap that with context
AppComponent = provideContext(AppComponent);

module.exports = AppComponent;
```
