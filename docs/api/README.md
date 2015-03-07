# API Documentation

`var Router = require('fluxible-router')` exports the following:

 * [`handleHistory`](handleHistory.md)
 * [`handleRoute`](handleRoute.md)
 * [`navigateAction`](navigateAction.md)
 * [`NavLink`](NavLink.md)
 * [`RouteStore`](RouteStore.md)

or if you're using ES6:

```js
import {handleHistory, handleRoute, navigateAction, NavLink, RouteStore} from 'fluxible';
```

## Addons

`var RouterAddons = require('fluxible-router/addons')` also provides an alternative history implementation:

 * [`RouterAddons.HistoryWithHash`](addons/HistoryWithHash.md)

or if you're using ES6:

```js
import {HistoryWithHash} from 'fluxible-router/addons';
```

This is not bundled with the main export so as not to bloat the package with unused code.
