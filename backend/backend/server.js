
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const storeUrl = process.env.WC_STORE_URL;
const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET;

function isWooConfigured() {
  return Boolean(storeUrl && consumerKey && consumerSecret);
}

app.get("/", (req, res) => {
  res.json({
    name: "SmartCRM API",
    status: "running",
    mode: isWooConfigured() ? "woocommerce" : "demo"
  });
});

app.get("/api/woocommerce/status", (req, res) => {
  res.json({
    connected: isWooConfigured(),
    mode: isWooConfigured() ? "woocommerce" : "demo",
    message: isWooConfigured()
      ? "WooCommerce credentials are configured."
      : "Demo mode: configure store credentials to connect WooCommerce."
  });
});

async function wooRequest(endpoint) {
  const base = storeUrl.replace(/\/+$/, "");
  const url = new URL(
    base + "/wp-json/wc/v3/" + endpoint
  );

  url.searchParams.set("consumer_key", consumerKey);
  url.searchParams.set("consumer_secret", consumerSecret);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `WooCommerce returned HTTP ${response.status}`
    );
  }

  return response.json();
}

app.get("/api/woocommerce/orders", async (req, res) => {
  if (!isWooConfigured()) {
    return res.json({
      mode: "demo",
      message: "These are examples, not live WooCommerce orders.",
      orders: [
        {
          id: 1001,
          status: "processing",
          total: "1499.00",
          currency: "INR"
        },
        {
          id: 1002,
          status: "completed",
          total: "899.00",
          currency: "INR"
        }
      ]
    });
  }

  try {
    const orders = await wooRequest(
      "orders?per_page=20"
    );

    res.json({
      mode: "woocommerce",
      orders: orders.map(order => ({
        id: order.id,
        status: order.status,
        total: order.total,
        currency: order.currency,
        customer_id: order.customer_id,
        date_created: order.date_created
      }))
    });
  } catch (error) {
    res.status(502).json({
      error: "Could not retrieve WooCommerce orders.",
      details: error.message
    });
  }
});

app.get("/api/woocommerce/customers", async (req, res) => {
  if (!isWooConfigured()) {
    return res.json({
      mode: "demo",
      message: "These are examples, not live WooCommerce customers.",
      customers: [
        {
          id: 1,
          first_name: "Ananya",
          last_name: "Sharma",
          email: "ananya@example.com"
        },
        {
          id: 2,
          first_name: "Rahul",
          last_name: "Patil",
          email: "rahul@example.com"
        }
      ]
    });
  }

  try {
    const customers = await wooRequest(
      "customers?per_page=20"
    );

    res.json({
      mode: "woocommerce",
      customers: customers.map(customer => ({
        id: customer.id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email
      }))
    });
  } catch (error) {
    res.status(502).json({
      error: "Could not retrieve WooCommerce customers.",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`SmartCRM API listening on port ${PORT}`);
});
