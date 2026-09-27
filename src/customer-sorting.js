(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CustomerSorting = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const nameCollator = new Intl.Collator("ja", { numeric:true, sensitivity:"base" });

  function byName(records, direction = "asc") {
    if (direction !== "asc" && direction !== "desc") return records.slice();
    const multiplier = direction === "desc" ? -1 : 1;
    return records.map((record, index) => ({ record, index })).sort((a, b) => {
      const nameOrder = nameCollator.compare(String(a.record.name || ""), String(b.record.name || ""));
      return nameOrder ? nameOrder * multiplier : a.index - b.index;
    }).map(item => item.record);
  }

  return { byName };
});
