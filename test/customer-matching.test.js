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

test("imports handover, rank and after-project columns", () => {
  const rows = matching.parseCsv("顧客ID,顧客名1氏名,引渡,ランク,アフター案件あり\n1,山田太郎,2025/01/10,A,あり");
  assert.deepEqual(matching.rowsToCustomers(rows)[0], {
    customerId:"1", name1:"山田太郎", handoverDate:"2025/01/10", rank:"A", hasAfterProject:"あり"
  });
});

test("automatically resolves the best candidate while preserving suggested state", () => {
  const registration = { name:"山田太郎", tel:"09012345678" };
  const customers = [
    { customerId:"other", name1:"山田太郎", tel1:"08000000000" },
    { customerId:"best", name1:"別の人", tel1:"090-1234-5678" }
  ];
  assert.equal(matching.resolveCustomer(registration, customers).customerId, "best");
  assert.equal(matching.matchState(registration, customers), "suggested");
});

test("manual match overrides the automatic candidate", () => {
  const registration = { name:"山田太郎", tel:"09012345678", matchedCustomerId:"manual" };
  const customers = [
    { customerId:"auto", name1:"山田太郎", tel1:"09012345678" },
    { customerId:"manual", name1:"手動選択", tel1:"" }
  ];
  assert.equal(matching.resolveCustomer(registration, customers).customerId, "manual");
  assert.equal(matching.matchState(registration, customers), "confirmed");
});

test("omitted CSV columns do not become blank updates", () => {
  const customer = matching.rowsToCustomers(matching.parseCsv("顧客ID,顧客名1氏名\n1,山田太郎"))[0];
  assert.equal(Object.hasOwn(customer, "rank"), false);
  assert.deepEqual(matching.customerChanges({ customerId:"1", name1:"山田太郎", rank:"A" }, customer), []);
  assert.deepEqual(matching.customerChanges({ customerId:"1", name1:"旧姓" }, customer), ["name1"]);
});
