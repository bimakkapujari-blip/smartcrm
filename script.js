
"use strict";

const $ = (id) => document.getElementById(id);

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
  return String(value).replace(/[&<>"']/g, char => ({
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
  }).format(value);
}

function showMessage(text, error = false) {
  $("message").textContent = text;
  $("message").style.color = error ? "#b91c1c" : "#047857";
}

function customerName(id) {
  const customer = customers.find(c => c.id === id);
  return customer ? customer.name : "Unknown customer";
}

/* Automatically create one demo order for a customer
   who does not already have any orders. */
function createDemoOrderForCustomer(customer) {
  const alreadyHasOrder = orders.some(
    order => Number(order.customerId) === Number(customer.id)
  );

  if (alreadyHasOrder) return;

  const nextOrderId = Math.max(
    1000,
    ...orders.map(order => Number(order.id) || 0)
  ) + 1;

  orders.push({
    id: nextOrderId,
    customerId: customer.id,
    amount: 500,
    status: "Processing"
  });
}

/* Add demo orders for existing customers who have none. */
customers.forEach(createDemoOrderForCustomer);
saveData();

function renderStats() {
  $("customerCount").textContent = customers.length;
  $("orderCount").textContent = orders.length;

  $("pendingCount").textContent = orders.filter(
    order => order.status !== "Delivered"
  ).length;

  $("salesTotal").textContent = money(
    orders.reduce((sum, order) => sum + Number(order.amount), 0)
  );
}

function renderCustomers() {
  const query = $("searchInput").value.trim().toLowerCase();

  const filtered = customers.filter(customer =>
    [
      customer.name,
      customer.email,
      customer.phone,
      customer.notes
    ].some(value => String(value || "").toLowerCase().includes(query))
  );

  $("customerList").innerHTML = filtered.length
    ? filtered.map(customer => `
        <article class="customer-card">
          <div>
            <h3>${escapeHTML(customer.name)}</h3>
            <p>${escapeHTML(customer.email)} · ${escapeHTML(customer.phone)}</p>
            <p>Notes: ${escapeHTML(customer.notes || "No notes")}</p>
          </div>
          <button class="summary-btn" data-id="${customer.id}">
            View summary
          </button>
        </article>
      `).join("")
    : '<p class="empty">No matching customers found.</p>';

  $("assistantCustomer").innerHTML = customers.length
    ? customers.map(customer => `
        <option value="${customer.id}">
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
          <td>#${order.id}</td>
          <td>${escapeHTML(customerName(order.customerId))}</td>
          <td>${money(order.amount)}</td>
          <td>
            <span class="status ${order.status}">
              ${escapeHTML(order.status)}
            </span>
          </td>
          <td>
            <select data-order-id="${order.id}"
                    aria-label="Update order ${order.id}">
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
  const customer = customers.find(c => c.id === Number(id));
  if (!customer) return null;

  const customerOrders = orders.filter(
    order => Number(order.customerId) === Number(customer.id)
  );

  const total = customerOrders.reduce(
    (sum, order) => sum + Number(order.amount), 0
  );

  const pending = customerOrders.filter(
    order => order.status !== "Delivered"
  );

  return { customer, customerOrders, total, pending };
}

function generateSuggestion(id) {
  const data = customerSummary(id);

  if (!data) {
    $("assistantOutput").textContent =
      "Please add or select a customer.";
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

/* Show the new-customer form. */
$("showFormBtn").addEventListener("click", () => {
  $("customerForm").classList.remove("hidden");
  $("nameInput").focus();
});

/* Cancel adding a customer. */
$("cancelFormBtn").addEventListener("click", () => {
  $("customerForm").reset();
  $("customerForm").classList.add("hidden");
  showMessage("");
});

/* Add customer and automatically create a demo order. */
$("customerForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("nameInput").value.trim();
  const email = $("emailInput").value.trim().toLowerCase();
  const phone = $("phoneInput").value.trim();
  const notes = $("notesInput").value.trim();

  if (customers.some(c => c.email.toLowerCase() === email)) {
    showMessage("A customer with this email already exists.", true);
    return;
  }

  const nextId = Math.max(
    0,
    ...customers.map(customer => Number(customer.id) || 0)
  ) + 1;

  const newCustomer = {
    id: nextId,
    name,
    email,
    phone,
    notes
  };

  customers.push(newCustomer);
  createDemoOrderForCustomer(newCustomer);

  const saved = saveData();

  $("customerForm").reset();
  $("customerForm").classList.add("hidden");

  renderAll();
  $("assistantCustomer").value = String(nextId);

  if (saved) {
    showMessage(
      `Customer added and demo order created successfully.`
    );
  }
});

/* Search customers. */
$("searchInput").addEventListener("input", renderCustomers);

/* Filter orders. */
$("orderFilter").addEventListener("change", renderOrders);

/* Update an order and refresh dashboard totals. */
$("orderList").addEventListener("change", event => {
  const select = event.target.closest("select[data-order-id]");
  if (!select) return;

  const order = orders.find(
    item => Number(item.id) === Number(select.dataset.orderId)
  );

  if (!order) {
    showMessage("Order not found.", true);
    return;
  }

  order.status = select.value;

  const saved = saveData();

  renderAll();

  if (saved) {
    showMessage(`Order #${order.id} status updated to ${order.status}.`);
  }
});

/* Generate a summary from a customer card. */
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

/* Generate a customer follow-up message. */
$("generateBtn").addEventListener("click", () => {
  generateSuggestion($("assistantCustomer").value);
});

/* Copy the suggested message. */
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

/* Start the dashboard. */
renderAll();

console.info("SmartCRM loaded successfully.");
