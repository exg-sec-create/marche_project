"use strict";

const BASE_URL = "https://customer.exceed-group.co.jp";

function crmUrl(path) {
  if (typeof path !== "string" || !/^\/api\/inbound\/link-qr(?:\/[A-Za-z0-9_-]+)?$/.test(path)) {
    throw new Error("invalid LINE CRM path");
  }
  return BASE_URL + path;
}

async function requestLineCrm({ path, method = "GET", apiKey, body, fetchImpl = fetch }) {
  const response = await fetchImpl(crmUrl(path), {
    method,
    headers: {
      "X-API-Key": apiKey,
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const text = await response.text();
  let payload;
  try { payload = text ? JSON.parse(text) : {}; }
  catch (_) { payload = { detail: "LINE顧客CRMから不正な応答が返されました" }; }
  return { status: response.status, payload };
}

module.exports = { BASE_URL, crmUrl, requestLineCrm };
