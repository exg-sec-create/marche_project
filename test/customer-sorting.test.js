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

test("counts only advance owner bookings as reservations", () => {
  const records = [
    { id:"advance", registrationType:"owner", registrationMode:"advance", slot:"10:00–11:00", checkedIn:true },
    { id:"onsite-owner", registrationType:"owner", registrationMode:"onsite", checkedIn:true },
    { id:"general", registrationType:"general", registrationMode:"onsite", checkedIn:true },
    // Legacy records have no registrationMode; an owner slot identifies the old advance form.
    { id:"legacy-advance", registrationType:"owner", slot:"11:00–12:00", checkedIn:false },
    { id:"legacy-onsite", registrationType:"owner", slot:"", checkedIn:true }
  ];

  const summary = sorting.reservationSummary(records);
  assert.deepEqual(summary.reservations.map(record => record.id), ["advance", "legacy-advance"]);
  assert.deepEqual(summary.arrived.map(record => record.id), ["advance"]);
  assert.equal(summary.rate, 50);
});

test("an explicit onsite mode is not treated as a reservation even if a slot is later added", () => {
  assert.equal(sorting.isAdvanceReservation({ registrationType:"owner", registrationMode:"onsite", slot:"10:00–11:00" }), false);
});

test("summarizes each slot using advance reservations only", () => {
  const records = [
    { id:"waiting", registrationType:"owner", registrationMode:"advance", slot:"10:00–11:00", checkedIn:false },
    { id:"arrived", registrationType:"owner", registrationMode:"advance", slot:"10:00–11:00", checkedIn:true },
    { id:"onsite", registrationType:"owner", registrationMode:"onsite", slot:"10:00–11:00", checkedIn:true },
    { id:"other-slot", registrationType:"owner", registrationMode:"advance", slot:"11:00–12:00", checkedIn:true }
  ];

  const summary = sorting.reservationSlotSummary(records, "10:00–11:00");
  assert.deepEqual(summary.reservations.map(record => record.id), ["waiting", "arrived"]);
  assert.deepEqual(summary.arrived.map(record => record.id), ["arrived"]);
});

test("summarizes total slot arrivals and the onsite subset", () => {
  const slots = ["10:00–11:00", "11:00–12:00"];
  const records = [
    { id:"advance", registrationType:"owner", registrationMode:"advance", checkedIn:true, checkedInAt:new Date(2026, 8, 27, 10, 10) },
    { id:"onsite", registrationType:"owner", registrationMode:"onsite", checkedIn:true, checkedInAt:new Date(2026, 8, 27, 10, 20) },
    { id:"general", registrationType:"general", checkedIn:true, checkedInAt:new Date(2026, 8, 27, 10, 30) },
    { id:"waiting", registrationType:"owner", registrationMode:"advance", checkedIn:false }
  ];

  const summary = sorting.arrivalSlotSummary(records, "10:00–11:00", slots);
  assert.deepEqual(summary.arrivals.map(record => record.id), ["advance", "onsite", "general"]);
  assert.deepEqual(summary.onsite.map(record => record.id), ["onsite", "general"]);
});
