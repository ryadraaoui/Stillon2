// Test double for the Stripe REST API. Used ONLY by the automated tests; never shipped.
import http from "node:http";
http.createServer((req, res) => {
  const j = (o, c = 200) => { res.writeHead(c, { "Content-Type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url.startsWith("/v1/prices/")) return j({ id: "price_test", unit_amount: 1234, currency: "cad", active: true });
  if (req.method === "POST" && req.url === "/v1/checkout/sessions") return j({ id: "cs_test_new", url: "http://localhost:3001/checkout-mock/cs_test_new" });
  if (req.url === "/v1/checkout/sessions/cs_test_paid") return j({ payment_status: "paid", customer_details: { email: "qa@example.com" } });
  if (req.url === "/v1/checkout/sessions/cs_test_unpaid") return j({ payment_status: "unpaid" });
  j({ error: { message: "not found" } }, 404);
}).listen(4010);
