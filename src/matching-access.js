(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.MatchingAccess = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PASSWORD = "123456";

  function verify(value) {
    return typeof value === "string" && value === PASSWORD;
  }

  return { verify };
});
