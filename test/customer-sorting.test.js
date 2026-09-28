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

test("sorts checked-in customers in both directions and leaves missing times last", () => {
  const records = [
    { id:"middle", checkedInAt:new Date("2026-09-27T10:30:00Z") },
    { id:"missing" },
    { id:"early", checkedInAt:{ toDate:() => new Date("2026-09-27T09:10:00Z") } },
    { id:"late", checkedInAt:new Date("2026-09-27T14:20:00Z") }
  ];
  assert.deepEqual(sorting.byCheckedInAt(records, "asc").map(record => record.id), ["early", "middle", "late", "missing"]);
  assert.deepEqual(sorting.byCheckedInAt(records, "desc").map(record => record.id), ["late", "middle", "early", "missing"]);
});

test("maps the actual check-in time to a configured time slot", () => {
  const slots = ["9:00–10:00", "10:00–11:00", "14:00–15:30"];
  assert.equal(sorting.arrivalSlot({ checkedInAt:new Date(2026, 8, 27, 10, 0) }, slots), "10:00–11:00");
  assert.equal(sorting.arrivalSlot({ checkedInAt:new Date(2026, 8, 27, 15, 29) }, slots), "14:00–15:30");
  assert.equal(sorting.arrivalSlot({}, slots), "");
});

test("flags possible duplicate owner reservations by normalized phone or name", () => {
  const records = [
    { id:"a", registrationType:"owner", name:"山田 太郎", tel:"090-1234-5678" },
    { id:"b", registrationType:"owner", name:"別名", tel:"09012345678" },
    { id:"c", registrationType:"owner", name:"山田　太郎", tel:"" },
    { id:"general", registrationType:"general", name:"山田 太郎", tel:"09012345678" },
    { id:"unique", registrationType:"owner", name:"佐藤 花子", tel:"08000000000" }
  ];
  assert.deepEqual([...sorting.possibleDuplicateOwnerIds(records)].sort(), ["a", "b", "c"]);
});
