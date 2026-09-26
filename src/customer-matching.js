(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CustomerMatching = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const HEADER_ALIASES = {
    customerId: ["顧客ID", "顧客id"],
    externalSystemId: ["案件ID", "案件Id", "案件id", "andpad_id", "ANDPAD_ID", "ANDPAD ID"],
    enabled: ["有効設定"],
    brand: ["ブランド"],
    office: ["担当拠点"],
    store: ["担当店"],
    salesperson: ["担当営業"],
    phase: ["フェーズ"],
    name1: ["顧客名1氏名", "顧客名", "氏名"],
    kana1: ["顧客名1かな", "かな"],
    tel1: ["電話番号1", "電話番号"],
    name2: ["顧客名2氏名"],
    kana2: ["顧客名2かな"],
    tel2: ["電話番号2"],
    postalCode: ["郵便番号"],
    prefecture: ["都道府県"],
    oldAddress: ["旧住所"],
    newAddress: ["新住所"],
    remarks: ["備考"],
    handoverDate: ["引渡", "引渡日", "引き渡し日", "お引渡日"],
    rank: ["ランク"],
    hasAfterProject: ["アフター案件あり", "アフター案件有り", "アフター案件", "アフター有無"]
  };

  function parseCsv(text) {
    const rows = [];
    let row = [], field = "", quoted = false;
    const source = String(text || "").replace(/^\uFEFF/, "");
    for (let i = 0; i < source.length; i += 1) {
      const char = source[i];
      if (quoted) {
        if (char === '"' && source[i + 1] === '"') { field += '"'; i += 1; }
        else if (char === '"') quoted = false;
        else field += char;
      } else if (char === '"') quoted = true;
      else if (char === ",") { row.push(field); field = ""; }
      else if (char === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
      else field += char;
    }
    if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
    return rows.filter(columns => columns.some(value => String(value).trim()));
  }

  function cleanHeader(value) { return String(value || "").replace(/^\uFEFF/, "").trim().replace(/\s+/g, ""); }
  function normalizeName(value) { return String(value || "").normalize("NFKC").toLowerCase().replace(/[\s\u3000・･.．,，、]/g, ""); }
  function normalizeTel(value) { return String(value || "").normalize("NFKC").replace(/\D/g, ""); }
  function normalizeAddress(value) { return String(value || "").normalize("NFKC").toLowerCase().replace(/[\s\u3000\-ー−―‐・,，]/g, ""); }

  function rowsToCustomers(rows) {
    if (!rows.length) return [];
    const headers = rows[0].map(cleanHeader);
    const indexes = {};
    Object.entries(HEADER_ALIASES).forEach(([key, aliases]) => {
      indexes[key] = headers.findIndex(header => aliases.map(cleanHeader).includes(header));
    });
    if (indexes.customerId < 0 || indexes.name1 < 0) throw new Error("CSVに「顧客ID」と「顧客名1氏名」の列が必要です。");
    return rows.slice(1).map(columns => {
      const value = key => indexes[key] >= 0 ? String(columns[indexes[key]] || "").trim() : "";
      const customer = {};
      // 差分CSVにない列は返さず、既存値を空文字で上書きしない。
      Object.keys(HEADER_ALIASES).forEach(key => { if (indexes[key] >= 0) customer[key] = value(key); });
      return customer;
    }).filter(customer => customer.customerId && customer.name1);
  }

  function scoreCustomer(registration, customer) {
    const registrationTel = normalizeTel(registration.tel);
    const registrationName = normalizeName(registration.name);
    const registrationAddress = normalizeAddress(registration.address);
    const phones = [customer.tel1, customer.tel2].map(normalizeTel).filter(Boolean);
    const names = [customer.name1, customer.name2, customer.kana1, customer.kana2].map(normalizeName).filter(Boolean);
    const addresses = [customer.oldAddress, customer.newAddress].map(normalizeAddress).filter(Boolean);
    let score = 0;
    const reasons = [];
    if (registrationTel && phones.includes(registrationTel)) { score += 100; reasons.push("電話番号一致"); }
    if (registrationName && names.includes(registrationName)) { score += 60; reasons.push("氏名一致"); }
    if (registrationAddress && addresses.some(address => address === registrationAddress)) { score += 35; reasons.push("住所一致"); }
    else if (registrationAddress && addresses.some(address => address.length >= 8 && (address.includes(registrationAddress) || registrationAddress.includes(address)))) { score += 20; reasons.push("住所類似"); }
    return { score, reasons };
  }

  function findCandidates(registration, customers, limit = 5) {
    return customers.map(customer => ({ customer, ...scoreCustomer(registration, customer) }))
      .filter(candidate => candidate.score > 0)
      .sort((a, b) => b.score - a.score || a.customer.customerId.localeCompare(b.customer.customerId, "ja"))
      .slice(0, limit);
  }

  function matchState(registration, customers) {
    if (registration.matchedCustomerId) return "confirmed";
    const candidates = findCandidates(registration, customers);
    if (!candidates.length) return "none";
    const top = candidates[0];
    const tied = candidates.filter(candidate => candidate.score === top.score).length > 1;
    return top.score >= 100 && !tied ? "suggested" : "review";
  }

  // 担当者が確定した顧客を優先し、未確定の場合も最上位候補を自動的に利用する。
  // matchState は未確定のままなので、画面には「自動候補」「要確認」が残る。
  function resolveCustomer(registration, customers) {
    const confirmed = customers.find(customer => customer.customerId === registration.matchedCustomerId);
    return confirmed || findCandidates(registration, customers, 1)[0]?.customer || null;
  }

  function customerChanges(existing, incoming) {
    if (!existing) return Object.keys(incoming).filter(key => key !== "customerId");
    return Object.keys(incoming).filter(key => key !== "customerId" && String(existing[key] ?? "") !== String(incoming[key] ?? ""));
  }

  return { HEADER_ALIASES, parseCsv, rowsToCustomers, normalizeName, normalizeTel, normalizeAddress, scoreCustomer, findCandidates, matchState, resolveCustomer, customerChanges };
});
