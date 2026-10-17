
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const storeUrl = process.env.WC_STORE_URL;
const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET;

const isWooConfigured = () =>
  Boolean(storeUrl && consumerKey && consumerSecret);

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
      : "Demo mode: no WooCommerce store credentials configured."
  });
});

app.get("/api/woocommerce/customers", async (req, res) => {
  if (!isWooConfigured()) {
    return res.json({
      mode: "demo",
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
    const url = new URL(
      storeUrl.replace(/\/+$/, "") +
      "/wp-json/wc/v3/customers"
    );

    url.searchParams.set("per_page", "20");

    const auth = Buffer.from(
      `${consumerKey}:${consumerSecret}`
    ).toString("base64");

    const response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` }
    });

    if (!response.ok) {
      return res.status(502).json({
        error: "Could not retrieve WooCommerce customers."
      });
    }

    const customers = await response.json();

    res.json({
      mode: "woocommerce",
      customers: customers.map(customer => ({
        id: customer.id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email
      }))
    });
  } catch {
    res.status(502).json({
      error: "WooCommerce request failed. Check the store URL and connection."
    });
  }
});

app.get("/api/woocommerce/orders", async (req, res) => {
  if (!isWooConfigured()) {
    return res.json({
      mode: "demo",
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
    const url = new URL(
      storeUrl.replace(/\/+$/, "") +
      "/wp-json/wc/v3/orders"
    );

    url.searchParams.set("per_page", "20");

    const auth = Buffer.from(
      `${consumerKey}:${consumerSecret}`
    ).toString("base64");

    const response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` }
    });

    if (!response.ok) {
      return res.status(502).json({
        error: "Could not retrieve WooCommerce orders."
      });
    }

    const orders = await response.json();

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
  } catch {
    res.status(502).json({
      error: "WooCommerce request failed. Check the store URL and connection."
    });
  }
});

app.listen(PORT, () => {
  console.log(`SmartCRM API running on port ${PORT}`);
});
