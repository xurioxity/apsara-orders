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

const productOptions = [
  "Dummy 13",
  "Starburst Sword",
  "Training Staff - LONG",
  "Training Staff - Short",
  "Training Sword ",
  "Thunderstrike ",
  "Void Katana ",
  "Silent Katana ",
  "Soul Cleaver",
  "Dummy 13 Stand - Small",
  "Reaper Machete",
  "Dummy 13 Hat",
  "Byte Knife - 2 pieces ",
  "Striker SMG ",
  "Apex Handgun - 2 pieces",
  "Blades of Chaos ",
  "Pro Blade",
  "Octopus Claws  ",
  "Wings",
  "Junior Bike",
  "Morning Star",
  "Weapons Pack Level - 1",
  "Dog - Dummy 13",
];

function createProductRow(product = "", color = "#000000") {
  const row = document.createElement("div");
  row.classList.add("product-row");

  const productSelect = document.createElement("select");
  productSelect.classList.add("product-dropdown");
  productOptions.forEach(option => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    if (option === product) opt.selected = true;
    productSelect.appendChild(opt);
  });
const colors = [
  { name: "Black", code: "#000000" },
  { name: "Blue", code: "#0000FF" },
  { name: "Gold", code: "#FFD700" },
  { name: "Peak Green", code: "#00FF9F" },
  { name: "Pink", code: "#FF69B4" },
  { name: "Purple", code: "#800080" },
  { name: "Red", code: "#FF0000" },
  { name: "White", code: "#FFFFFF" },
  { name: "Yellow", code: "#FFFF00" },
  { name: "Chocolate", code: "#D2691E" },
  { name: "Green", code: "#008000" },
  { name: "Orange", code: "#FFA500" }
];

const colorWrapper = document.createElement("div");
colorWrapper.classList.add("color-wrapper");

let selectedColor = color || "#000000";
let selectedColorName = "Black";

// Color Swatch UI
colors.forEach(c => {
  const circle = document.createElement("div");
  circle.classList.add("color-circle");
  circle.style.backgroundColor = c.code;
  circle.title = c.name;

  if (c.code === selectedColor) {
    circle.classList.add("selected");
    selectedColorName = c.name;
  }

  circle.onclick = () => {
    selectedColor = c.code;
    selectedColorName = c.name;

    colorWrapper.querySelectorAll(".color-circle").forEach(el => el.classList.remove("selected"));
    circle.classList.add("selected");
  };

  colorWrapper.appendChild(circle);
});


  const removeBtn = document.createElement("button");
  removeBtn.textContent = "🗑";
  removeBtn.type = "button";
  removeBtn.classList.add("remove-btn");
  removeBtn.onclick = () => row.remove();

  row.appendChild(productSelect);
  row.appendChild(colorWrapper);
  row.appendChild(removeBtn);

  document.getElementById("productColorContainer").appendChild(row);
}

document.getElementById("addProductBtn").addEventListener("click", () => {
  createProductRow();
});

// ✅ Auto-add first row on page load
window.addEventListener("DOMContentLoaded", () => createProductRow());


// ➕ Submit new order
document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const order = {
   productNames: Array.from(document.querySelectorAll(".product-row")).map(row => row.querySelector("select").value),
colors: Array.from(document.querySelectorAll(".product-row")).map(row => {
  const selected = row.querySelector(".color-circle.selected");
  return selected?.title || "Black";
}),

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
     // 🔁 Recreate product+color rows
document.getElementById("productColorContainer").innerHTML = "";

order.productNames.forEach((prod, i) => {
  const colorName = order.colors[i] || "Black";

  // Get hex code by color name
  const colorHex = {
    "Black": "#000000", "Blue": "#0000FF", "Gold": "#FFD700", "Peak Green": "#00FF9F",
    "Pink": "#FF69B4", "Purple": "#800080", "Red": "#FF0000", "White": "#FFFFFF",
    "Yellow": "#FFFF00", "Chocolate": "#D2691E", "Green": "#008000", "Orange": "#FFA500"
  }[colorName] || "#000000";

  createProductRow(prod, colorHex);
});

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
document.getElementById("sortSelect").addEventListener("change", function () {
  const selected = this.value;
  const container = document.getElementById("pendingOrders");
  const rows = Array.from(container.querySelectorAll("tr"));

  if (selected === "priority") {
    const priorityValue = { High: 1, Medium: 2, Low: 3 };
    rows.sort((a, b) => {
      const aText = a.querySelector(".priority").textContent.trim();
      const bText = b.querySelector(".priority").textContent.trim();
      return priorityValue[aText] - priorityValue[bText];
    });
  }

  if (selected === "date") {
    rows.sort((a, b) => {
  const aDate = new Date(a.querySelector(".orderDate").textContent.split("/").reverse().join("-"));
  const bDate = new Date(b.querySelector(".orderDate").textContent.split("/").reverse().join("-"));
  return bDate - aDate; // ✅ Newest first
});

  }

  rows.forEach(row => container.appendChild(row));
});
document.getElementById("sourceFilter").addEventListener("change", function () {
  const selectedSource = this.value.toLowerCase();

  document.querySelectorAll("#pendingOrders tr").forEach(row => {
    const sourceCell = row.querySelector(".source")?.textContent.toLowerCase() || "";

    if (selectedSource === "all" || sourceCell === selectedSource) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});
document.getElementById("finishedSortSelect").addEventListener("change", function () {
  const selected = this.value;
  const container = document.getElementById("finishedOrders");
  const rows = Array.from(container.querySelectorAll("tr"));

  if (selected === "orderDate") {
    rows.sort((a, b) => {
      const aDate = new Date(a.querySelector(".orderDate").textContent.split("/").reverse().join("-"));
      const bDate = new Date(b.querySelector(".orderDate").textContent.split("/").reverse().join("-"));
      return aDate - bDate;
    });
  }

  rows.forEach(row => container.appendChild(row));
});
document.addEventListener("keydown", function (e) {
  // Alt-based shortcuts
  if (e.altKey) {
    switch (e.key.toLowerCase()) {
      case 'a': // Alt + A → focus product name input
        e.preventDefault();
        document.getElementById("productName").focus();
        break;
      case 's': // Alt + S → focus search bar
        e.preventDefault();
        document.getElementById("searchInput").focus();
        break;
      case 'p': // Alt + P → scroll to pending
        e.preventDefault();
        document.getElementById("pendingOrders").scrollIntoView({ behavior: "smooth" });
        break;
      case 'f': // Alt + F → scroll to finished
        e.preventDefault();
        document.getElementById("finishedOrders").scrollIntoView({ behavior: "smooth" });
        break;
    }
  }

  // 🔥 Alt + Enter to submit order
  if (e.altKey && e.key === "Enter") {
    e.preventDefault();
    document.getElementById("orderForm").requestSubmit(); // Safely trigger form submission
  }
});





















