# RouterMixin
`RouterMixin` is a React mixin to be used by application's top level React component to:

* [manage browser history](#history-management-browser-support-and-hash-based-routing) when route changes, and
* execute navigate action and then dispatch `CHANGE_ROUTE_START` and `CHANGE_ROUTE_SUCCESS` or `CHANGE_ROUTE_FAILURE` events via flux dispatcher on window `popstate` events
* [manage scroll position](#scroll-position-management) when navigating between pages

Note that the RouterMixing reads your component's `state.route`; your component is responsible for setting this value.  Typically this would be done by setting up a store which listens for 'CHANGE_ROUTE_SUCCESS' events.

## Example Usage
```js
// AppStateStore.js
var createStore = require('fluxible/addons').createStore;
module.exports = createStore({
  storeName: 'AppStateStore',
  handlers: {
    'CHANGE_ROUTE_SUCCESS': 'onNavigate'
  },
  initialize: function() {
    this.route = null;
  },
  dehydrate: function() {
    return this.route;
  },
  rehydrate: function(state) {
    this.route = state;
  },
  onNavigate: function(route) {
    this.route = route;
    return this.emitChange();
  }
});
```

```js
// Application.jsx
var RouterMixin = require('flux-router-component').RouterMixin;
var AppStateStore = require('../stores/AppStateStore');

var Application = React.createClass({
    mixins: [FluxibleMixin, RouterMixin],
    
    statics: {
        storeListeners: [AppStateStore]
    },
    
    getInitialState: function() {
        return {route: this.getStore(AppStateStore).route};
    };
    
    onChange: function() {
        this.setState({
            route: this.getStore(AppStateStore).route
        });
    };
    
    ...
});
```
