const test = require("node:test");
const assert = require("node:assert/strict");
const matchingAccess = require("../src/matching-access.js");

test("accepts the configured customer matching password", () => {
  assert.equal(matchingAccess.verify("123456"), true);
});

test("rejects incorrect or loosely matching passwords", () => {
  assert.equal(matchingAccess.verify("654321"), false);
  assert.equal(matchingAccess.verify(" 123456 "), false);
  assert.equal(matchingAccess.verify(123456), false);
  assert.equal(matchingAccess.verify(), false);
});
