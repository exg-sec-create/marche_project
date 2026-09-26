const test = require("node:test");
const assert = require("node:assert/strict");
const matching = require("../src/customer-matching.js");

test("quoted fields and Japanese headers are parsed", () => {
  const rows = matching.parseCsv('\uFEFF顧客ID,顧客名1氏名,電話番号1,旧住所\r\ncid_1,"佐藤, 太郎",090-1234-5678,"山形市\n一丁目"');
  const customers = matching.rowsToCustomers(rows);
  assert.equal(customers[0].customerId, "cid_1");
  assert.equal(customers[0].name1, "佐藤, 太郎");
  assert.equal(customers[0].oldAddress, "山形市\n一丁目");
});

test("telephone exact match is stronger than name match", () => {
  const registration = { name: "佐藤 太郎", tel: "09012345678" };
  const candidates = matching.findCandidates(registration, [
    { customerId:"name", name1:"佐藤太郎", tel1:"080-0000-0000" },
    { customerId:"phone", name1:"別の人", tel1:"090-1234-5678" }
  ]);
  assert.equal(candidates[0].customer.customerId, "phone");
  assert.deepEqual(candidates[0].reasons, ["電話番号一致"]);
});

test("duplicate top scores require review", () => {
  const registration = { name:"佐藤太郎", tel:"" };
  const customers = [
    { customerId:"1", name1:"佐藤 太郎" },
    { customerId:"2", name1:"佐藤　太郎" }
  ];
  assert.equal(matching.matchState(registration, customers), "review");
});
