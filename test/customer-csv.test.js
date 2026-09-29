const test = require("node:test");
const assert = require("node:assert/strict");
const customerCsv = require("../src/customer-csv.js");

test("exports completed after support with the staff email address", () => {
  assert.deepEqual(customerCsv.afterSupportColumns({
    afterSupportCompleted:true,
    afterSupportCompletedBy:"staff@example.com"
  }), ["TRUE", "staff@example.com"]);
});

test("exports incomplete or missing after support as FALSE without an address", () => {
  assert.deepEqual(customerCsv.afterSupportColumns({ afterSupportCompleted:false }), ["FALSE", ""]);
  assert.deepEqual(customerCsv.afterSupportColumns({
    afterSupportCompleted:false,
    afterSupportCompletedBy:"stale@example.com"
  }), ["FALSE", ""]);
  assert.deepEqual(customerCsv.afterSupportColumns({}), ["FALSE", ""]);
});
