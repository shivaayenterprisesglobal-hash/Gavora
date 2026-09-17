# Demo data

Files in this directory are **placeholder fixtures** for UI development. They are not live
inventory and must not be mixed with API responses.

The storefront catalogue (Home, Shop, Product Details, search, wishlist) now reads from
`GET /api/products` and `GET /api/categories` via [`src/lib/catalog.js`](../lib/catalog.js).

| File               | Status                                                      |
| ------------------ | ----------------------------------------------------------- |
| `categories.js`    | Fixture only — not imported by `catalog.js`                 |
| `products.js`      | Fixture only — not imported by `catalog.js`                 |
| `reviews.js`       | Sample layout copy, still labelled as sample on the homepage |
| `demoAccount.js`   | Account/order placeholders until those APIs exist           |

Do not import `products.js` or `categories.js` from pages or components. That would silently mix
fixture data with MongoDB-backed catalogue data.
