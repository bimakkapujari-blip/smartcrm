
"use strict";

const $ = (id) => document.getElementById(id);

const API_BASE = "https://smartcrm-silk.vercel.app";

const initialCustomers = [
  {
    id: 1,
    name: "Ananya Sharma",
    email: "ananya@example.com",
    phone: "9876543210",
    notes: "Interested in new arrivals"
  },
  {
    id: 2,
    name: "Rahul Patil",
    email: "rahul@example.com",
    phone: "9876501234",
    notes: "Asked about delivery time"
  },
  {
    id: 3,
    name: "Priya Naik",
    email: "priya@example.com",
    phone: "9988776655",
    notes: "Repeat customer"
  }
];

const initialOrders = [
  { id: 1001, customerId: 1, amount: 1499, status: "Processing" },
  { id: 1002, customerId: 2, amount: 899, status: "Shipped" },
  { id: 1003, customerId: 3, amount: 2200, status: "Delivered" },
  { id: 1004, customerId: 1, amount: 650, status: "Delivered" }
];

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback.map(item => ({ ...item }));
  } catch {
    return fallback.map(item => ({ ...item }));
  }
}

let customers = loadData("smartcrm_customers", initialCustomers);
let orders = loadData("smartcrm_orders", initialOrders);

function saveData() {
  try {
    localStorage.setItem("smartcrm_customers", JSON.stringify(customers));
    localStorage.setItem("smartcrm_orders", JSON.stringify(orders));
    return true;
  } catch {
    showMessage("Could not save data in this browser.", true);
    return false;
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function showMessage(text, error = false) {
  const message = $("message");
  if (!message) return;

  message.textContent = text;
  message.style.color = error ? "#b91c1c" : "#047857";
}

function customerName(id) {
  const customer = customers.find(c => Number(c.id) === Number(id));
  return customer ? customer.name : "Unknown customer";
}

function renderStats() {
  $("customerCount").textContent = customers.length;
  $("orderCount").textContent = orders.length;

  $("pendingCount").textContent = orders.filter(
    o => o.status !== "Delivered"
  ).length;

  $("salesTotal").textContent = money(
    orders.reduce((sum, order) => sum + Number(order.amount || 0), 0)
  );
}

function renderCustomers() {
  const query = $("searchInput").value.trim().toLowerCase();

  const filtered = customers.filter(customer =>
    [customer.name, customer.email, customer.phone, customer.notes]
      .some(value => String(value || "").toLowerCase().includes(query))
  );

  $("customerList").innerHTML = filtered.length
    ? filtered.map(customer => `
      <article class="customer-card">
        <div>
          <h3>${escapeHTML(customer.name)}</h3>
          <p>${escapeHTML(customer.email)} · ${escapeHTML(customer.phone)}</p>
          <p>Notes: ${escapeHTML(customer.notes || "No notes")}</p>
        </div>
        <button class="summary-btn" data-id="${Number(customer.id)}">
          View summary
        </button>
      </article>
    `).join("")
    : '<p class="empty">No matching customers found.</p>';

  $("assistantCustomer").innerHTML = customers.length
    ? customers.map(customer => `
        <option value="${Number(customer.id)}">
          ${escapeHTML(customer.name)}
        </option>
      `).join("")
    : '<option value="">No customers available</option>';
}

function renderOrders() {
  const filter = $("orderFilter").value;

  const filtered = orders.filter(order =>
    filter === "All" || order.status === filter
  );

  $("orderList").innerHTML = filtered.length
    ? filtered.map(order => `
      <tr>
        <td>#${Number(order.id)}</td>
        <td>${escapeHTML(customerName(order.customerId))}</td>
        <td>${money(order.amount)}</td>
        <td>
          <span class="status ${escapeHTML(order.status)}">
            ${escapeHTML(order.status)}
          </span>
        </td>
        <td>
          <select data-order-id="${Number(order.id)}"
                  aria-label="Update order ${Number(order.id)}">
            ${["Processing", "Shipped", "Delivered"].map(status => `
              <option value="${status}"
                ${order.status === status ? "selected" : ""}>
                ${status}
              </option>
            `).join("")}
          </select>
        </td>
      </tr>
    `).join("")
    : '<tr><td colspan="5">No orders match this filter.</td></tr>';
}

function renderAll() {
  renderStats();
  renderCustomers();
  renderOrders();
}

function customerSummary(id) {
  const customer = customers.find(c => Number(c.id) === Number(id));
  if (!customer) return null;

  const customerOrders = orders.filter(
    order => Number(order.customerId) === Number(customer.id)
  );

  const total = customerOrders.reduce(
    (sum, order) => sum + Number(order.amount || 0), 0
  );

  const pending = customerOrders.filter(
    order => order.status !== "Delivered"
  );

  return { customer, customerOrders, total, pending };
}

function generateSuggestion(id) {
  const data = customerSummary(id);

  if (!data) {
    $("assistantOutput").textContent = "Please add or select a customer.";
    $("copyBtn").classList.add("hidden");
    return;
  }

  const { customer, customerOrders, total, pending } = data;

  const summary =
    `${customer.name} has ${customerOrders.length} order(s), ` +
    `with total demo purchases of ${money(total)}. ` +
    `${pending.length} order(s) are not yet delivered. ` +
    `Customer notes: ${customer.notes || "No notes available"}.`;

  let message;

  if (pending.length > 0) {
    message =
      `Hi ${customer.name}, thank you for shopping with us! ` +
      "We wanted to keep you updated on your order. " +
      "Please contact us if you need any help.";
  } else if (customerOrders.length > 0) {
    message =
      `Hi ${customer.name}, thank you for being our valued customer! ` +
      "We hope you enjoyed your purchase. Let us know if we can help you again.";
  } else {
    message =
      `Hi ${customer.name}, welcome! We'd love to help you find ` +
      "the right products. Please contact us if you have any questions.";
  }

  $("assistantOutput").innerHTML = `
    <p><strong>Customer summary</strong></p>
    <p>${escapeHTML(summary)}</p>
    <p><strong>Suggested follow-up</strong></p>
    <p id="suggestedMessage">${escapeHTML(message)}</p>
  `;

  $("copyBtn").classList.remove("hidden");
}

// Connect to the deployed SmartCRM backend.
async function loadFromAPI() {
  try {
    const [customerResponse, orderResponse] = await Promise.all([
      fetch(`${API_BASE}/api/woocommerce/customers`),
      fetch(`${API_BASE}/api/woocommerce/orders`)
    ]);

    if (!customerResponse.ok || !orderResponse.ok) {
      throw new Error("The API returned an error.");
    }

    const customerData = await customerResponse.json();
    const orderData = await orderResponse.json();

    if (!Array.isArray(customerData.customers) ||
        !Array.isArray(orderData.orders)) {
      throw new Error("Unexpected API response.");
    }

    customers = customerData.customers.map(customer => {
      const existing = initialCustomers.find(
        item => Number(item.id) === Number(customer.id)
      );

      return {
        id: Number(customer.id),
        name: [
          customer.first_name,
          customer.last_name
        ].filter(Boolean).join(" ") || "Customer",
        email: customer.email || "",
        phone: existing?.phone || "",
        notes: existing?.notes || "Loaded from SmartCRM API"
      };
    });

    orders = orderData.orders.map(order => {
      const existing = initialOrders.find(
        item => Number(item.id) === Number(order.id)
      );

      let status = String(order.status || "processing").toLowerCase();

      if (status === "completed" || status === "delivered") {
        status = "Delivered";
      } else if (
        status === "shipped" ||
        status === "partially-shipped"
      ) {
        status = "Shipped";
      } else {
        status = "Processing";
      }

      return {
        id: Number(order.id),
        customerId: Number(
          order.customer_id || existing?.customerId || 1
        ),
        amount: Number(order.total ?? existing?.amount ?? 0),
        status
      };
    });

    saveData();
    renderAll();
    showMessage(
      `Connected to SmartCRM API in ${customerData.mode || "demo"} mode.`
    );
  } catch (error) {
    console.error("SmartCRM API connection failed:", error);
    showMessage(
      "Could not load API data. Showing saved browser data instead.",
      true
    );
  }
}

$("showFormBtn").addEventListener("click", () => {
  $("customerForm").classList.remove("hidden");
  $("nameInput").focus();
});

$("cancelFormBtn").addEventListener("click", () => {
  $("customerForm").reset();
  $("customerForm").classList.add("hidden");
  showMessage("");
});

$("customerForm").addEventListener("submit", event => {
  event.preventDefault();

  const email = $("emailInput").value.trim().toLowerCase();

  if (customers.some(c => c.email.toLowerCase() === email)) {
    showMessage("A customer with this email already exists.", true);
    return;
  }

  const nextId = Math.max(
    0,
    ...customers.map(c => Number(c.id))
  ) + 1;

  customers.push({
    id: nextId,
    name: $("nameInput").value.trim(),
    email,
    phone: $("phoneInput").value.trim(),
    notes: $("notesInput").value.trim()
  });

  saveData();
  $("customerForm").reset();
  $("customerForm").classList.add("hidden");
  renderAll();
  $("assistantCustomer").value = String(nextId);
  showMessage("Customer added and saved in this browser.");
});

$("searchInput").addEventListener("input", renderCustomers);
$("orderFilter").addEventListener("change", renderOrders);

$("orderList").addEventListener("change", event => {
  const select = event.target.closest("select[data-order-id]");
  if (!select) return;

  const order = orders.find(
    item => Number(item.id) === Number(select.dataset.orderId)
  );

  if (!order) return;

  order.status = select.value;
  saveData();
  renderAll();
  showMessage(`Order #${order.id} status updated in this browser.`);
});

$("customerList").addEventListener("click", event => {
  const button = event.target.closest(".summary-btn");
  if (!button) return;

  $("assistantCustomer").value = button.dataset.id;
  generateSuggestion(button.dataset.id);

  $("assistantOutput").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});

$("generateBtn").addEventListener("click", () => {
  generateSuggestion($("assistantCustomer").value);
});

$("copyBtn").addEventListener("click", async () => {
  const message = $("suggestedMessage")?.textContent;
  if (!message) return;

  try {
    await navigator.clipboard.writeText(message);
    showMessage("Follow-up message copied.");
  } catch {
    showMessage(
      "Copy unavailable here. Select and copy the message manually.",
      true
    );
  }
});

function runSelfTests() {
  const passed = [
    Array.isArray(customers),
    Array.isArray(orders),
    orders.every(order =>
      ["Processing", "Shipped", "Delivered"].includes(order.status)
    ),
    customers.every(customer =>
      customer.id !== undefined && customer.email
    )
  ].filter(Boolean).length;

  console.info(`SmartCRM startup checks: ${passed}/4 passed`);
}

renderAll();
runSelfTests();
loadFromAPI();
