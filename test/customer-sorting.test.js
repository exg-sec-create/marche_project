const test = require("node:test");
const assert = require("node:assert/strict");
const sorting = require("../src/customer-sorting.js");

test("sorts customers by name in ascending order", () => {
  const records = [{ name:"やまだ 太郎" }, { name:"あべ 花子" }, { name:"すずき 一郎" }];
  assert.deepEqual(sorting.byName(records, "asc").map(record => record.name), ["あべ 花子", "すずき 一郎", "やまだ 太郎"]);
});

test("sorts customers by name in descending order", () => {
  const records = [{ name:"あべ 花子" }, { name:"やまだ 太郎" }, { name:"すずき 一郎" }];
  assert.deepEqual(sorting.byName(records, "desc").map(record => record.name), ["やまだ 太郎", "すずき 一郎", "あべ 花子"]);
});

test("does not mutate the source order and keeps equal names stable", () => {
  const records = [{ id:"first", name:"佐藤" }, { id:"second", name:"佐藤" }, { id:"third", name:"伊藤" }];
  assert.deepEqual(sorting.byName(records, "asc").map(record => record.id), ["third", "first", "second"]);
  assert.deepEqual(records.map(record => record.id), ["first", "second", "third"]);
});
