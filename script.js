const ordersRef = firebase.database().ref("orders");

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

// 🔄 Load and sync all orders in real-time
ordersRef.on("value", snapshot => {
  document.getElementById("pendingOrders").innerHTML = "";
  document.getElementById("finishedOrders").innerHTML = "";

  snapshot.forEach(child => {
    const order = child.val();
    const id = child.key;
    addOrderToTable(order, id);
  });
});

// ➕ Submit new order
document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const order = {
    productNames: document.getElementById("productName").value.split(','),
    colors: document.getElementById("color").value.split(','),
    customerName: document.getElementById("customerName").value,
    source: document.getElementById("source").value,
    dispatchDate: document.getElementById("dispatchDate").value,
    orderDate: document.getElementById("orderDate").value,
    priority: document.getElementById("priority").value,
    finished: false
  };

  ordersRef.push(order);
  document.getElementById("orderForm").reset();
});

function addOrderToTable(order, firebaseKey) {
  const row = document.createElement("tr");

  const formattedProducts = order.productNames.map((p, i) =>
    `${p.trim()} - ${order.colors[i] ? order.colors[i].trim() : 'N/A'}`
  ).join('<br>');

  const priorityColors = {
    High: "#28a745",
    Medium: "#ffc107",
    Low: "#dc3545"
  };

  row.innerHTML = `
    <td class="productName">${formattedProducts}</td>
    <td class="customerName">${order.customerName}</td>
    <td class="source">${order.source}</td>
    <td class="dispatchDate">${formatDate(order.dispatchDate)}</td>
    <td class="orderDate">${formatDate(order.orderDate)}</td>
    <td class="priority" style="background-color: ${priorityColors[order.priority]}; color: white; border-radius: 5px; text-align: center;">
      ${order.priority}
    </td>
    <td>
      ${order.finished ? `
        <button class="delete">Delete</button>
      ` : `
        <button class="finished">Mark as Finished</button>
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      `}
    </td>
  `;

  const table = order.finished ? document.getElementById("finishedOrders") : document.getElementById("pendingOrders");
  table.appendChild(row);

  // 🗑️ Delete Order
  row.querySelector(".delete").addEventListener("click", () => {
    if (confirm("Delete this order?")) {
      ordersRef.child(firebaseKey).remove();
    }
  });

  if (!order.finished) {
    // ✅ Mark as Finished
    row.querySelector(".finished").addEventListener("click", () => {
      order.finished = true;
      ordersRef.child(firebaseKey).set(order);
    });

    // ✏️ Edit Order
    row.querySelector(".edit").addEventListener("click", () => {
      document.getElementById("productName").value = order.productNames.join(', ');
      document.getElementById("color").value = order.colors.join(', ');
      document.getElementById("customerName").value = order.customerName;
      document.getElementById("source").value = order.source;
      document.getElementById("dispatchDate").value = order.dispatchDate;
      document.getElementById("orderDate").value = order.orderDate;
      document.getElementById("priority").value = order.priority;

      ordersRef.child(firebaseKey).remove();
    });
  }
}

// 🔍 Search + Highlight
document.getElementById("searchInput").addEventListener("input", function () {
  const filter = this.value.toLowerCase();
  const rows = document.querySelectorAll("#pendingOrders tr, #finishedOrders tr");

  rows.forEach(row => {
    const nameCell = row.querySelector(".customerName");
    const productCell = row.querySelector(".productName");

    nameCell.innerHTML = nameCell.textContent;
    productCell.innerHTML = productCell.textContent;

    const name = nameCell.textContent.toLowerCase();
    const product = productCell.textContent.toLowerCase();

    if (name.includes(filter) || product.includes(filter)) {
      row.style.display = "";
      if (filter !== "") {
        const regex = new RegExp(filter, "gi");
        nameCell.innerHTML = nameCell.textContent.replace(regex, m => `<span class="highlight">${m}</span>`);
        productCell.innerHTML = productCell.textContent.replace(regex, m => `<span class="highlight">${m}</span>`);
      }
    } else {
      row.style.display = "none";
    }
  });
});



















