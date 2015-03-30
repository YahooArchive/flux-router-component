# NavLink
`NavLink` is the a React component for navigational links.  When the link is clicked, NavLink will execute a [navigateAction]('./navigateAction.md').  Stores can register for `CHANGE_ROUTE_SUCCESS` handlers if they are interested
in navigation events.

| Prop Name | Prop Type | Description |
|------------|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| href | String | The url string |
| routeName | String | Not used if `href` is specified. This is the name of the target route, which should be defined in your app's routes. |
| navParams | Object | If `href` prop is not available, `navParams` object will be used together with `routeName` to generate the href for the link.  This object needs to contain route params the route path needs.  Eg. for a route path `/article/:id`, `navParams.id` will be the article ID. |
| followLink | boolean, default to false | If set to true, client side navigation will be disabled.  NavLink will just act like a regular anchor link. |


## Example Usage

Here are two examples of generating `NavLink` using `href` property, and using `routeName` property.  Using `href` property is better than using `routeName`, because:

* Using `href` makes your code more readible, as it shows exactly how the `href` is generated.
* Using `routeName` assumes `this.context` or `this.props.context` has a `makePath()` function, which will be used to generate the `href` from the `routeName` and `navParams` props.
* Using `routeName` could be more limited, especially when it comes to query string and hash fragment, if the `makePath()` function does not support query string and hash fragment.

### Example of Using `href` Property (Recommended)

If the url is static, or you can generate the url outside of `Navlink`, you can simply pass the url to `NavLink` as a prop.  Here is an example:

```js
var NavLink = require('flux-router-component').NavLink;

var Nav = React.createClass({
    render: function () {
        // This example is using this.props.context for Nav and NavLink components.
        // You can also use the React context, as described in the Context section of this doc.
        var pages,
            links,
            context = this.props.context;
        pages = [
            {
                name: 'home',
                url: '/home',
                text: 'Home'
            },
            {
                name: 'about',
                url: '/about',
                text: 'About Us'
            }
        ];
        links = pages.map(function (page) {
            return (
                <li className="navItem">
                    <NavLink href={page.url} context={context}>
                        {page.text}
                    </NavLink>
                </li>
            );
        });
        return (
            <ul className="nav">
                {links}
            </ul>
        );

    }
});
```

### Example of Using `routeName` Property

Before you continue with this example, you should know that you can always generate the url yourself outside of `NavLink` and pass it to `NavLink` as `href` prop just like the example above.  Your code will be more straight-forward that way, and you will have more control over how to generate `href` (see more explanations in [the Example Usage section](#example-usage)).

If you choose not to generate `href` yourself and the `context` prop you pass to `NavLink` provides `makePath(routeName, routeParams)`, you can also use the `routeName` prop (and the optional `navParams` prop).  If the `href` prop is not present, `NavLink` will use `makePath(this.props.routeName, this.props.navParams)` from either `this.context` or `this.props.context` to generate the `href` for the anchor element. The `navParams` prop is useful for dynamic routes.  It should be a hash object containing the route parameters and their values.


Here is a quick example code showcasing how to use `routeName` prop along with `navParams` prop:

```js
// assume routes are defined somewhere like this:
// var routes = {
//     home: {
//         path: '/',
//         page: 'home'
//     },
//     article: {
//         path: '/article/:id',
//         page: 'article'
//     }
// };
var pages = [
    {
        routeName: 'home',
        text: 'Home'
    },
    {
        routeName: 'article',
        routeParams: {
            id: 'a'
        }
        text: 'Article A'
    }
];
var Nav = React.createClass({
    render: function () {
        // context should provide executeAction() and makePath().
        // This example is using this.props.context for Nav and NavLink components.
        // You can also use the React context, as described in the Context section of this doc.
        var context = this.props.context;
        var links = pages.map(function (page) {
            return (
                <li className="navItem">
                    <NavLink routeName={page.routeName} navParams={page.routeParams} context={context}>
                        {page.text}
                    </NavLink>
                </li>
            );
        });
        return (
            <ul className="nav">
                {links}
            </ul>
        );
    }
});
```
