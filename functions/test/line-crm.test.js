"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { crmUrl, requestLineCrm } = require("../line-crm");

test("crmUrl accepts only link QR API paths", () => {
  assert.equal(crmUrl("/api/inbound/link-qr/abc_123-Z"), "https://customer.exceed-group.co.jp/api/inbound/link-qr/abc_123-Z");
  assert.throws(() => crmUrl("https://example.com/steal"), /invalid/);
  assert.throws(() => crmUrl("/api/inbound/link-qr/a.png"), /invalid/);
});

test("requestLineCrm sends API key on the server", async () => {
  let received;
  const fetchImpl = async (url, options) => {
    received = { url, options };
    return { status: 200, text: async () => '{"token":"abc"}' };
  };
  const result = await requestLineCrm({
    path: "/api/inbound/link-qr", method: "POST", apiKey: "secret",
    body: { externalSystemId: "3409347" }, fetchImpl
  });
  assert.equal(received.options.headers["X-API-Key"], "secret");
  assert.deepEqual(JSON.parse(received.options.body), { externalSystemId: "3409347" });
  assert.deepEqual(result, { status: 200, payload: { token: "abc" } });
});
