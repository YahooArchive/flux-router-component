# RouterMixin
`RouterMixin` is a React mixin to be used by application's top level React component to:

* [manage browser history](#history-management-browser-support-and-hash-based-routing) when route changes, and
* execute navigate action and then dispatch `CHANGE_ROUTE_START` and `CHANGE_ROUTE_SUCCESS` or `CHANGE_ROUTE_FAILURE` events via flux dispatcher on window `popstate` events
* [manage scroll position](#scroll-position-management) when navigating between pages

## Example Usage
```js
var RouterMixin = require('flux-router-component').RouterMixin;

var Application = React.createClass({
    mixins: [RouterMixin],
    ...
});
```
