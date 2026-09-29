(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CustomerCsv = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function afterSupportColumns(record) {
    const completed = record?.afterSupportCompleted === true;
    return [
      completed ? "TRUE" : "FALSE",
      completed ? (record.afterSupportCompletedBy || "") : ""
    ];
  }

  return { afterSupportColumns };
});
