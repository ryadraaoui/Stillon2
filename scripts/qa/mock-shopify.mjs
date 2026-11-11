// Test double for the Shopify Storefront API. Used ONLY by automated tests; never shipped.
import http from "node:http";
const PRICES = { "gid://shopify/ProductVariant/101": 41, "gid://shopify/ProductVariant/102": 72, "gid://shopify/ProductVariant/103": 93 };
const REPEAT = { "gid://shopify/ProductVariant/102": 65, "gid://shopify/ProductVariant/103": 83 };
globalThis.last = null;
http.createServer((req, res) => {
  let body = ""; req.on("data", (c) => (body += c)); req.on("end", () => {
    const j = (o, c = 200) => { res.writeHead(c, { "Content-Type": "application/json" }); res.end(JSON.stringify(o)); };
    if (req.url === "/__last") return j(globalThis.last ?? {});
    if (req.headers["x-shopify-storefront-access-token"] !== "test-token") return j({ errors: [{ message: "Invalid token" }] }, 401);
    const { query, variables } = JSON.parse(body || "{}");
    if (query.includes("nodes(ids")) return j({ data: { nodes: variables.ids.map((id) => PRICES[id] ? ({ id, availableForSale: process.env.MOCK_UNAVAILABLE !== id, price: { amount: PRICES[id].toFixed(2), currencyCode: "USD" }, sellingPlanAllocations: { nodes: REPEAT[id] ? [{ sellingPlan: { id: "gid://shopify/SellingPlan/301" }, priceAdjustments: [{ price: { amount: REPEAT[id].toFixed(2) }, perDeliveryPrice: { amount: REPEAT[id].toFixed(2) } }] }] : [] } }) : null) } });
    if (query.includes("cartCreate")) { globalThis.last = variables.input; return j({ data: { cartCreate: { cart: { id: "gid://shopify/Cart/1", checkoutUrl: "http://localhost:3002/checkout-mock/cart1" }, userErrors: [] } } }); }
    j({ errors: [{ message: "unknown query" }] }, 400);
  });
}).listen(4020);
