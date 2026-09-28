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

  function checkedInTime(record) {
    const value = record && record.checkedInAt;
    const date = value && typeof value.toDate === "function" ? value.toDate() : new Date(value || "");
    const time = date.getTime();
    return Number.isFinite(time) ? time : null;
  }

  function byCheckedInAt(records, direction = "asc") {
    if (direction !== "asc" && direction !== "desc") return records.slice();
    const multiplier = direction === "desc" ? -1 : 1;
    return records.map((record, index) => ({ record, index, time:checkedInTime(record) })).sort((a, b) => {
      if (a.time === null || b.time === null) {
        if (a.time === b.time) return a.index - b.index;
        return a.time === null ? 1 : -1;
      }
      return (a.time - b.time) * multiplier || a.index - b.index;
    }).map(item => item.record);
  }

  function arrivalSlot(record, slots) {
    const time = checkedInTime(record);
    if (time === null) return "";
    const date = new Date(time);
    const minutes = date.getHours() * 60 + date.getMinutes();
    return (slots || []).find(slot => {
      const match = String(slot).match(/(\d{1,2}):(\d{2})\s*[–—~-]\s*(\d{1,2}):(\d{2})/);
      if (!match) return false;
      const start = Number(match[1]) * 60 + Number(match[2]);
      const end = Number(match[3]) * 60 + Number(match[4]);
      return minutes >= start && minutes < end;
    }) || "";
  }

  function possibleDuplicateOwnerIds(records) {
    const owners = (records || []).filter(record => record.registrationType === "owner");
    const normalize = value => String(value || "").normalize("NFKC").toLowerCase().replace(/[\s　()-]/g, "");
    const groups = new Map();
    owners.forEach(record => {
      const phone = normalize(record.tel).replace(/\D/g, "");
      const name = normalize(record.name);
      const keys = [...(phone ? [`tel:${phone}`] : []), ...(name.length >= 2 ? [`name:${name}`] : [])];
      keys.forEach(key => groups.set(key, [...(groups.get(key) || []), record.id]));
    });
    return new Set([...groups.values()].filter(ids => ids.length > 1).flat());
  }

  return { byName, byCheckedInAt, arrivalSlot, possibleDuplicateOwnerIds };
});
