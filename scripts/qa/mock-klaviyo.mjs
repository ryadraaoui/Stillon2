// Test double for the Klaviyo API. Used ONLY by automated tests; never shipped. Port 4030.
import http from "node:http";
const calls = [];
http.createServer((req, res) => {
  let body = ""; req.on("data", (c) => (body += c)); req.on("end", () => {
    const j = (o, c = 200) => { res.writeHead(c, { "Content-Type": "application/json" }); res.end(o === null ? "" : JSON.stringify(o)); };
    if (req.url === "/__calls") return j(calls);
    if (req.headers.authorization !== "Klaviyo-API-Key pk_test" || !req.headers.revision) return j({ errors: [{ detail: "bad auth" }] }, 401);
    const parsed = body ? JSON.parse(body) : null;
    calls.push({ method: req.method, url: req.url, body: parsed });
    if (req.method === "POST" && req.url === "/api/profile-import") return j({ data: { type: "profile", id: "P1" } }, 201);
    if (req.method === "POST" && req.url === "/api/profile-subscription-bulk-create-jobs") return j(null, 202);
    if (req.method === "GET" && req.url.startsWith("/api/lists/L123")) return j({ data: { type: "list", id: "L123", attributes: { name: "Waitlist", profile_count: Number(process.env.MOCK_COUNT ?? 412) } } });
    j({ errors: [{ detail: "unknown" }] }, 404);
  });
}).listen(4030);
