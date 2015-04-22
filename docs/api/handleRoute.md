# API: `handleRoute`

The `handleRoute` higher-order component handles listening to the [`RouteStore`](RouteStore.md) for changes and passes props to the supplied component.

`handleRoute` is leveraged in the [`handleHistory`](handleHistory.md) higher-order component and also in [`navigateAction`](navigateAction.md).

## Props Passed

These props will be passed to your component when a `RouteStore` change is emitted.

| Prop | Description |
|:-----|:------------|
| `currentNavigate` | The current payload received when `NAVIGATE_START` is dispatched. |
| `currentRoute` | The config object from the matched route. |
| `isActive` | A shortcut to `RouteStore.makePath`. See: [`RouteStore`](RouteStore.md). |
| `makePath` | A shortcut to `RouteStore.makePath`. See: [`RouteStore`](RouteStore.md). |
