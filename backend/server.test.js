
const { test } = require("node:test");
const assert = require("node:assert/strict");

const BASE_URL = "https://smartcrm-silk.vercel.app";

test("Health endpoint returns a running SmartCRM API", async () => {
  const response = await fetch(`${BASE_URL}/`);
  assert.equal(response.status, 200);

  const data = await response.json();
  assert.equal(data.name, "SmartCRM API");
  assert.equal(data.status, "running");
});

test("WooCommerce status endpoint returns a valid mode", async () => {
  const response = await fetch(
    `${BASE_URL}/api/woocommerce/status`
  );
  assert.equal(response.status, 200);

  const data = await response.json();
  assert.ok(["demo", "woocommerce"].includes(data.mode));
  assert.equal(typeof data.connected, "boolean");
});

test("Customers endpoint returns a customers array", async () => {
  const response = await fetch(
    `${BASE_URL}/api/woocommerce/customers`
  );
  assert.equal(response.status, 200);

  const data = await response.json();
  assert.ok(["demo", "woocommerce"].includes(data.mode));
  assert.ok(Array.isArray(data.customers));

  for (const customer of data.customers) {
    assert.ok(customer.id !== undefined);
    assert.equal(typeof customer.email, "string");
  }
});

test("Orders endpoint returns an orders array", async () => {
  const response = await fetch(
    `${BASE_URL}/api/woocommerce/orders`
  );
  assert.equal(response.status, 200);

  const data = await response.json();
  assert.ok(["demo", "woocommerce"].includes(data.mode));
  assert.ok(Array.isArray(data.orders));

  for (const order of data.orders) {
    assert.ok(order.id !== undefined);
    assert.equal(typeof order.status, "string");
  }
});
