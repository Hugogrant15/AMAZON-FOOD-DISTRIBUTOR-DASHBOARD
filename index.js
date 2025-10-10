
function distributorLogin(event) {
    event.preventDefault();

    const spinItem = document.querySelector('.spin2');
    spinItem.style.display = "inline-block";

    const getEmail = document.getElementById('email').value;
    const getPass = document.getElementById('password').value;

    if (getEmail === '' || getPass === '') {
        Swal.fire({
            icon: 'info',
            text: 'All fields are required!',
            confirmButtonColor: "#2D85DE"
        });
        spinItem.style.display = "none";
        return;
    }

    const signData = { email: getEmail, password: getPass };

    const signMethod = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signData)
    };

    // ✅ Corrected URL
    const url = 'http://localhost:3001/amazon/document/api/login';

    fetch(url, signMethod)
        .then(response => response.json())
        .then(result => {
        console.log("Login result:", result);

    if (result.success && result.token) {
        // ✅ decode token
        const tokenParts = result.token.split(".");
        const payload = JSON.parse(atob(tokenParts[1])); // contains _id, role

        console.log("Decoded payload:", payload);

        // ✅ check role before allowing login
        if (payload.role === "distributor" || payload.role === "super_admin") {
            // save token + ids in localStorage
            localStorage.setItem("key", result.token);
            localStorage.setItem("customerloginid", result._id);
            localStorage.setItem("city", payload.city);

            const currentId = localStorage.getItem('customerloginid');
            const previousId = localStorage.getItem('customerid');

            if (previousId && previousId !== currentId) {
                Swal.fire({
                    icon: 'info',
                    text: `You’re logging in with a different account`,
                    confirmButtonColor: "#2D85DE"
                });
            }

            Swal.fire({
                icon: 'success',
                text: `Login Successful`,
                confirmButtonColor: "#2D85DE"
            });

            // save permanent customer id
            localStorage.setItem("customerid", currentId);

            // ✅ redirect distributor / super_admin to dashboard
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);

        } else {
            // ❌ role not allowed
            Swal.fire({
                icon: 'error',
                text: 'Access denied: Only distributors or super admins can log in here.',
                confirmButtonColor: "#2D85DE"
            });
            spinItem.style.display = "none";
        }

    } else {
        Swal.fire({
            icon: 'info',
            text: result.message || 'Login Failed',
            confirmButtonColor: "#2D85DE"
        });
        spinItem.style.display = "none";
    }
})

        // .then(result => {
        //     console.log("Login result:", result);

        //     if (result.success && result.token) {
        //         // decode token
        //         const tokenParts = result.token.split(".");
        //         const payload = JSON.parse(atob(tokenParts[1]));

               

        //         // ✅ save token + ids in localStorage
        //         localStorage.setItem("key", result.token);
        //         localStorage.setItem("customerloginid", result._id);

        //         const currentId = localStorage.getItem('customerloginid');
        //         const previousId = localStorage.getItem('customerid');

        //         if (previousId && previousId !== currentId) {
        //             Swal.fire({
        //                 icon: 'info',
        //                 text: `You’re logging in with a different account`,
        //                 confirmButtonColor: "#2D85DE"
        //             });
        //         }

        //         Swal.fire({
        //             icon: 'success',
        //             text: `Login Successful`,
        //             confirmButtonColor: "#2D85DE"
        //         });

        //         // ✅ save permanent customer id
        //         localStorage.setItem("customerid", currentId);

        //         // ✅ redirect after short delay
        //         setTimeout(() => {
        //             window.location.href = "index.html";
        //         }, 2000);

        //     } else {
        //         Swal.fire({
        //             icon: 'info',
        //             text: result.message || 'Login Failed',
        //             confirmButtonColor: "#2D85DE"
        //         });
        //         spinItem.style.display = "none";
        //     }
        // })
        // .catch(error => {
        //     console.log('error', error);
        //     Swal.fire({
        //         icon: 'error',
        //         text: `Something went wrong, try again`,
        //         confirmButtonColor: "#2D85DE"
        //     });
        //     spinItem.style.display = "none";
        // });
}

function renderProductsTable(products, containerId = "bestSellingTable") {
  const table = document.getElementById(containerId);
  if (!table) return;

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  products.forEach(product => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(product.name)}</td>
      <td>${Number(product.sales || 0).toLocaleString()}</td>
      <td>${Number(product.stock || 0).toLocaleString()}</td>
      <td>₦${Number(product.price || 0).toLocaleString()}</td>
      <td class="${product.stock > 0 ? "text-success" : "text-danger"}">
        ${product.stock > 0 ? "In Stock" : "Out Of Stock"}
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function loadProductsForDashboard() {
  const table = document.getElementById("bestSellingTable");
  if (!table) return;

  try {
    const res = await fetch("http://localhost:3001/amazon/document/api/products");
    if (!res.ok) throw new Error("Failed to fetch products: " + res.status);
    const products = await res.json();

    const list = Array.isArray(products) ? products : (products.data || []);

    // Sort by sales (descending) and pick top 5
    const bestSelling = list
      .sort((a, b) => (b.sales || 0) - (a.sales || 0))
      .slice(0, 5);

    renderProductsTable(bestSelling);
  } catch (err) {
    console.error("Error loading dashboard products:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadProductsForDashboard);


function toggleNotification(event) {
    event.preventDefault();
    const notificationPopUp = document.getElementById('notificationPopUp');
    // notificationPopUp.style.display = "block";

    if (notificationPopUp.style.display === 'none' || notificationPopUp.style.display === '') {
        notificationPopUp.style.display = 'block';
    } else {
        notificationPopUp.style.display = 'none';
    }
}

function AllorderTable(event) {
    event.preventDefault();
    document.getElementById('AllorderTable').style.display = 'block';
    document.getElementById('PendingorderTable').style.display = 'none';
    document.getElementById('deliveredgorderTable').style.display = 'none';
    document.getElementById('cancelorderTable').style.display = 'none';

}

function PendingorderTable(event) {
    event.preventDefault();
    document.getElementById('PendingorderTable').style.display = 'block';
    document.getElementById('AllorderTable').style.display = 'none';
    document.getElementById('deliveredgorderTable').style.display = 'none';
    document.getElementById('cancelorderTable').style.display = 'none';

}

function deliveredgorderTable(event) {
    event.preventDefault();
    document.getElementById('deliveredgorderTable').style.display = 'block';
    document.getElementById('PendingorderTable').style.display = 'none';
    document.getElementById('AllorderTable').style.display = 'none';
    document.getElementById('cancelorderTable').style.display = 'none';

}

function cancelorderTable(event) {
    event.preventDefault();
    document.getElementById('cancelorderTable').style.display = 'block';
    document.getElementById('deliveredgorderTable').style.display = 'none';
    document.getElementById('PendingorderTable').style.display = 'none';
    document.getElementById('AllorderTable').style.display = 'none';
}


async function loadProducts() {
  try {
    const response = await fetch("http://localhost:3001/amazon/document/api/products"); // update with your API route
    if (!response.ok) throw new Error("Failed to fetch products");
    const products = await response.json();
    const tbody = document.querySelector("#TableId tbody");
    tbody.innerHTML = ""; // clear table first
    products.forEach(product => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.category?.name || "N/A"}</td>
        <td>${product.numberInStock}</td>
        <td>${product.price}</td>
        <td><span class="badge bg-success">Paid</span></td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading products:", error);
  }
}
// Call when the page loads
document.addEventListener("DOMContentLoaded", loadProducts);




// function to load customers by distributor location 

let allUsers = [];   // store all unique users
let currentPage = 1;
const pageSize = 5;  // rows per page

async function loadDistributorUsers() {
  try {
    const distributorCity = localStorage.getItem("city");
    if (!distributorCity) return console.warn("Distributor city not found");

    const res = await fetch("http://localhost:3001/amazon/document/api/orders");
    if (!res.ok) throw new Error("Failed to fetch orders");
    const orders = await res.json();

    const filteredOrders = orders.filter(order =>
      order.customerSnapshot?.city?.toLowerCase() === distributorCity.toLowerCase()
    );

    if (filteredOrders.length === 0) {
      document.getElementById("usersTableBody").innerHTML =
        `<tr><td colspan="6" class="text-center text-muted">No users found for ${distributorCity}</td></tr>`;
      return;
    }

    // Unique users
    const uniqueUsers = {};
    filteredOrders.forEach(order => {
      const c = order.customerSnapshot;
      if (c?.email && !uniqueUsers[c.email]) {
        uniqueUsers[c.email] = {
          fullName: `${c.firstName || ""} ${c.lastName || ""}`.trim(),
          email: c.email,
          city: c.city,
          phone: c.phone,
          image: "./images/New Customers List (3).png"
        };
      }
    });

    // Fetch status
    const userEmails = Object.keys(uniqueUsers);
    const statusRes = await fetch("http://localhost:3001/amazon/document/api/register/get-last-seen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: userEmails })
    });
    const statusData = await statusRes.json();

    // Save in global array
    allUsers = Object.values(uniqueUsers).map(user => {
      const lastSeen = statusData[user.email] || 0;
      const isOnline = Date.now() - lastSeen < 1000 * 60 * 5;
      return { ...user, isOnline };
    });

    renderTable();
  } catch (err) {
    console.error("Error loading distributor users:", err);
  }
}


// Render function with pagination + search
function renderTable() {
  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = "";

  const searchValue = document.getElementById("searchInput").value.toLowerCase();
  let filtered = allUsers.filter(u =>
    u.fullName.toLowerCase().includes(searchValue) ||
    u.email.toLowerCase().includes(searchValue) ||
    u.city.toLowerCase().includes(searchValue) ||
    (u.phone || "").toLowerCase().includes(searchValue)
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  if (currentPage > totalPages) currentPage = totalPages || 1;

  const start = (currentPage - 1) * pageSize;
  const pageUsers = filtered.slice(start, start + pageSize);

  pageUsers.forEach(user => {
    const statusColor = user.isOnline ? "#00A859" : "#9BACCA";
    const statusText = user.isOnline ? "Active" : "Offline";
    const pulseClass = user.isOnline ? "pulse" : "";

    const row = `
  <tr data-email="${user.email}">
    <td>
      <div class="d-flex align-items-center custOmerPtag">
        <img src="${user.image}" style="width: 25px;" alt="">
        <div class="ms-2">
          <small>${user.fullName}</small><br>
          <small style="color: #8D98AF; font-size: 10px;">@${user.fullName.split(" ")[0].toLowerCase()}</small>
        </div>
      </div>
    </td>
    <td>
      <div class="status-wrapper">
        <i class="fa-solid fa-circle me-2 status-icon ${pulseClass}" style="color:${statusColor};"></i>
        <span>${statusText}</span>
      </div>
    </td>
    <td>${user.email}</td>
    <td>${user.city}</td>
    <td>${user.phone || "-"}</td>
    <td><i class="fa-solid fa-ellipsis" style="color: #CBD3E1;"></i></td>
  </tr>
`;
    tbody.insertAdjacentHTML("beforeend", row);
  });

  document.getElementById("pageInfo").textContent = `Page ${currentPage} of ${totalPages || 1}`;
}

// Pagination buttons
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; renderTable(); }
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    const totalPages = Math.ceil(allUsers.length / pageSize);
    if (currentPage < totalPages) { currentPage++; renderTable(); }
  });

  document.getElementById("searchIcon").addEventListener("click", () => {
    const input = document.getElementById("searchInput");
    input.style.display = input.style.display === "none" ? "inline-block" : "none";
    if (input.style.display === "inline-block") input.focus();
  });

  document.getElementById("searchInput").addEventListener("input", () => {
    currentPage = 1;
    renderTable();
  });

  loadDistributorUsers();
});


// load customer card on dashboard
async function loadCustomerCards() {
  try {
    const res = await fetch("http://localhost:3001/amazon/document/api/orders");
    if (!res.ok) throw new Error("Failed to fetch orders");
    const orders = await res.json();

    // Extract unique customers
    const uniqueCustomers = {};
    orders.forEach(order => {
      const c = order.customerSnapshot;
      if (c && c.email && !uniqueCustomers[c.email]) {
        uniqueCustomers[c.email] = { ...c, id: order._id };
      }
    });

    // Take the last 4 (latest)
    const customers = Object.values(uniqueCustomers).slice(-4).reverse();

    const listContainer = document.getElementById("customerList");
    listContainer.innerHTML = "";

    customers.forEach(c => {
      const fullName = `${c.firstName || ""} ${c.lastName || ""}`.trim();
      const shortId = c.id ? c.id.slice(-5) : "N/A";

      const item = `
        <div class="d-flex align-items-center mb-3">
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random" 
               class="rounded-circle me-3" width="40" height="40" alt="${fullName}">
          <div>
            <strong class="d-block">${fullName || "Unknown"}</strong>
            <small class="text-muted">Customer ID#${shortId}</small>
          </div>
        </div>
      `;
      listContainer.insertAdjacentHTML("beforeend", item);
    });

  } catch (err) {
    console.error("Error loading customer cards:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadCustomerCards);
  
// customer order modal popup 
let currentCustomerOrders = [];
let currentPages = 1;
const pageSizes = 10;
let currentFilter = "all";
// Handle click on customer rows

document.addEventListener("click", async (e) => {
  const row = e.target.closest("tr[data-email]");
  if (!row) return;
  const email = row.dataset.email;
  const fullName =
    row.querySelector(".custOmerPtag small")?.textContent || "Customer";
  const modal = new bootstrap.Modal(
    document.getElementById("customerOrdersModal")
  );
  modal.show();
  document.getElementById("customerOrdersTableBody").innerHTML = `
    <tr><td colspan="6" class="text-center text-muted py-3">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Loading orders for ${fullName}...</p>
    </td></tr>
  `;
  document.getElementById("customerInfo").innerHTML = `
    <div class="d-flex align-items-center">
      <img src="./images/New Customers List (3).png" class="rounded-circle me-3" width="45" height="45" alt="">
      <div>
        <p class="fw-bold mb-0">${fullName}</p>
        <small class="text-muted">${email}</small>
      </div>
    </div>
  `;
  try {
    const res = await fetch("http://localhost:3001/amazon/document/api/orders");
    if (!res.ok) throw new Error("Failed to fetch orders");
    const orders = await res.json();
    currentCustomerOrders = orders.filter(
      (o) => o.customerSnapshot?.email?.toLowerCase() === email.toLowerCase()
    );
    currentPages = 1;
    renderCustomerOrders("all");
  } catch (err) {
    console.error("Error loading orders:", err);
    document.getElementById(
      "customerOrdersTableBody"
    ).innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading orders</td></tr>`;
  }
});

// Render orders with pagination
function renderCustomerOrders(filter = currentFilter) {
  currentFilter = filter;
  const tbody = document.getElementById("customerOrdersTableBody");
  tbody.innerHTML = "";
  // Apply filter
  let filtered = currentCustomerOrders;
  if (filter !== "all") {
    filtered = filtered.filter(
      (o) => o.paymentStatus?.toLowerCase() === filter
    );
  }
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSizes);
  if (totalPages === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No ${filter} orders found</td></tr>`;
    document.getElementById("paginationInfo").textContent =
      "Showing 0 of 0 items";
    document.getElementById("paginationControls").innerHTML = "";
    return;
  }
  // Slice data for current page
  const start = (currentPages - 1) * pageSizes;
  const paginated = filtered.slice(start, start + pageSizes);
  // Fill table
  paginated.forEach((order) => {
    const date = new Date(order.createdAt).toLocaleDateString("en-GB");
    const products = order.items?.map((i) => i.name).join(", ") || "—";
    const city = order.customerSnapshot?.city || "—";
    const gateway = order.totalAmount || "N/A";
    const status = order.paymentStatus?.toLowerCase();
    const statusHTML =
      status === "paid"
        ? `<i class="fa-solid fa-circle-check text-success"></i> Paid`
        : status === "failed"
        ? `<i class="fa-solid fa-circle-xmark text-danger"></i> Failed`
        : `<i class="fa-solid fa-circle-notch text-warning"></i> Pending`;
    tbody.insertAdjacentHTML(
      "beforeend",
      `
      <tr>
        <td>#${order._id.slice(-6)}</td>
        <td>${date}</td>
        <td>${products}</td>
        <td>${city}</td>
        <td>${gateway}</td>
        <td>${statusHTML}</td>
      </tr>
      `
    );
  });
  // Pagination info
  const showingFrom = start + 1;
  const showingTo = Math.min(start + pageSizes, totalItems);
  document.getElementById(
    "paginationInfo"
  ).textContent = `Showing ${showingFrom} to ${showingTo} of ${totalItems} items`;
  renderPaginationControls(totalPages);
}
// Build pagination controls
function renderPaginationControls(totalPages) {
  const pagination = document.getElementById("paginationControls");
  pagination.innerHTML = "";
  const prevDisabled = currentPages === 1 ? "disabled" : "";
  const nextDisabled = currentPages === totalPages ? "disabled" : "";
  pagination.insertAdjacentHTML(
    "beforeend",
    `<li class="page-item ${prevDisabled}">
       <a class="page-link" href="#" id="prevPage">&laquo;</a>
     </li>`
  );
  for (let i = 1; i <= totalPages; i++) {
    const active = currentPages === i ? "active" : "";
    pagination.insertAdjacentHTML(
      "beforeend",
      `<li class="page-item ${active}"><a class="page-link page-num" href="#">${i}</a></li>`
    );
  }
  pagination.insertAdjacentHTML(
    "beforeend",
    `<li class="page-item ${nextDisabled}">
       <a class="page-link" href="#" id="nextPage">&raquo;</a>
     </li>`
  );
  // Handlers
  pagination.querySelectorAll(".page-num").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      currentPages = parseInt(link.textContent);
      renderCustomerOrders(currentFilter);
    });
  });
  const prev = pagination.querySelector("#prevPage");
  const next = pagination.querySelector("#nextPage");
  if (prev)
    prev.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPages > 1) {
        currentPages--;
        renderCustomerOrders(currentFilter);
      }
    });
  if (next)
    next.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPages < totalPages) {
        currentPages++;
        renderCustomerOrders(currentFilter);
      }
    });
}
// Tab clicks
document.querySelectorAll(".order-tab").forEach((tab) => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();
    document
      .querySelectorAll(".order-tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentPages = 1;
    renderCustomerOrders(tab.dataset.status);
  });
});


// LOAD LATEST ORDER ON DASHBOARD
async function loadLatestOrders() {
  try {
    const res = await fetch("http://localhost:3001/amazon/document/api/orders");
    if (!res.ok) throw new Error("Failed to fetch orders");
    const orders = await res.json();

    // Sort by createdAt (newest first)
    const latestOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);

    const tbody = document.getElementById("latestOrdersBody");
    tbody.innerHTML = "";

    latestOrders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleString("en-GB");
      const amount = `₦${order.totalAmount.toLocaleString()}`;
      const status = order.paymentStatus?.toLowerCase();

      let statusHTML = "";
      if (status === "paid") {
        statusHTML = `<span class="badge bg-success">Completed</span>`;
      } else if (status === "failed") {
        statusHTML = `<span class="badge bg-danger">Declined</span>`;
      } else {
        statusHTML = `<span class="badge bg-warning">Pending</span>`;
      }

      const row = `
        <tr>
          <td>Payment from #${order._id.slice(-5)}</td>
          <td>${date}</td>
          <td>${amount}</td>
          <td>${statusHTML}</td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  } catch (err) {
    console.error("Error loading latest orders:", err);
  }
}
// Load when page is ready
document.addEventListener("DOMContentLoaded", loadLatestOrders);


// LOAD CUSTOMER NOTIFICATION FEED (with unseen tracking)
// =====================
let lastSeenOrderTime = localStorage.getItem("lastSeenOrderTime") 
  ? new Date(localStorage.getItem("lastSeenOrderTime")) 
  : new Date(0);

document.addEventListener("DOMContentLoaded", () => {
  loadCityOrdersFeed();

  // ✅ Bell click → mark as seen
  document.body.addEventListener("click", (e) => {
    if (e.target.closest(".btnSharp")) {
      const badge = document.getElementById("notificationBadge");
      if (badge) badge.style.display = "none";

      // Mark latest order time as seen
      localStorage.setItem("lastSeenOrderTime", new Date().toISOString());
    }
  });

  // 🔁 Auto-refresh every 30 seconds
  setInterval(loadCityOrdersFeed, 30000);
});

async function loadCityOrdersFeed() {
  try {
    const distributorCity = localStorage.getItem("city");
    if (!distributorCity) {
      console.warn("Distributor city not found in localStorage.");
      return;
    }

    const res = await fetch("http://localhost:3001/amazon/document/api/orders");
    const orders = await res.json();

    // ✅ Filter orders by city
    const filteredOrders = orders.filter(
      (o) =>
        o.customerSnapshot?.city?.toLowerCase() ===
        distributorCity.toLowerCase()
    );

    // ✅ Sort newest first
    const sortedOrders = filteredOrders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const feed = document.getElementById("activityFeed");
    feed.innerHTML = "";

    if (sortedOrders.length === 0) {
      feed.innerHTML = `<li class="text-muted text-center">No recent activity in ${distributorCity}</li>`;
      updateNotificationBadge(0);
      return;
    }

    // ✅ Show 10 recent
    sortedOrders.slice(0, 10).forEach((order) => {
      const firstName = order.customerSnapshot?.firstName || "Unknown";
      const lastName = order.customerSnapshot?.lastName
        ? order.customerSnapshot.lastName.charAt(0) + "."
        : "";
      const total = order.totalAmount
        ? order.totalAmount.toLocaleString()
        : "0";
      const payment = order.paymentStatus || "pending";
      const createdAt = new Date(order.createdAt);
      const timeAgo = formatTimeAgo(createdAt);

      const badgeClass =
        payment.toLowerCase() === "paid"
          ? "bg-success-subtle text-success"
          : payment.toLowerCase() === "failed"
          ? "bg-danger-subtle text-danger"
          : "bg-warning-subtle text-warning";

      const avatar = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`;

      feed.insertAdjacentHTML(
        "beforeend",
        `
        <li class="d-flex align-items-center mb-3 border-bottom pb-2">
          <img src="${avatar}" class="rounded-circle me-3" width="40" height="40" alt="${firstName}">
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between">
              <strong>${firstName} ${lastName}</strong>
              <small class="text-muted">${timeAgo}</small>
            </div>
            <div class="text-muted small">Placed an order worth ₦${total}</div>
          </div>
          <span class="badge rounded-pill ${badgeClass}">${payment}</span>
        </li>
        `
      );
    });

    // ✅ New unseen notifications logic
    const newOrders = sortedOrders.filter(
      (o) => new Date(o.createdAt) > lastSeenOrderTime
    );
    updateNotificationBadge(newOrders.length);
  } catch (err) {
    console.error("Error loading city orders feed:", err);
  }
}

// 🕒 Helper function → format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "min", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1)
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

// 🔔 Update notification badge
function updateNotificationBadge(count) {
  const badge = document.getElementById("notificationBadge");
  if (!badge) return;
  if (count > 0) {
    badge.style.display = "inline-block";
    badge.textContent = count > 9 ? "9+" : count;
  } else {
    badge.style.display = "none";
  }
}



// LOAD BEST SELLING PRODUCT (DOUGHNUT CHART)
document.addEventListener("DOMContentLoaded", loadBestSellingProducts);
async function loadBestSellingProducts() {
  try {
    const distributorCity = localStorage.getItem("city");
    if (!distributorCity) {
      console.warn("City not found in localStorage");
      return;
    }

    const res = await fetch("http://localhost:3001/amazon/document/api/orders");
    const orders = await res.json();

    // ✅ Filter by distributor city
    const cityOrders = orders.filter(
      (o) =>
        o.customerSnapshot?.city?.toLowerCase() ===
        distributorCity.toLowerCase()
    );

    // ✅ Aggregate product quantities
    const productMap = {};
    cityOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const name = item.name;
        if (!productMap[name]) {
          productMap[name] = {
            quantity: 0,
            image: item.image || "",
          };
        }
        productMap[name].quantity += item.quantity || 0;
      });
    });

    const products = Object.entries(productMap)
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        image: data.image,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);

    if (products.length === 0) {
      document.getElementById("productLegend").innerHTML =
        "<p class='text-muted text-center'>No products found</p>";
      return;
    }

    const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);

    // ✅ Chart.js setup
    const ctx = document.getElementById("bestSellingChart").getContext("2d");
    const colors = ["#3b82f6", "#a855f7", "#22c55e", "#f97316"]; // Blue, Purple, Green, Orange

    const chartData = {
      labels: products.map((p) => p.name),
      datasets: [
        {
          data: products.map((p) => p.quantity),
          backgroundColor: colors.slice(0, products.length),
          borderWidth: 0,
          cutout: "90%",
        },
      ],
    };

    // ✅ Safely destroy old chart if exists
    if (
      window.bestSellingChart &&
      typeof window.bestSellingChart.destroy === "function"
    ) {
      window.bestSellingChart.destroy();
    }

    // ✅ Plugin for text in center
    const centerTextPlugin = {
      id: "centerText",
      afterDraw(chart) {
        const { ctx, chartArea: { width, height } } = chart;
        ctx.save();
        ctx.font = "bold 24px 'Poppins', sans-serif";
        ctx.fillStyle = "#111";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(totalUnits.toLocaleString(), width / 2, height / 2 - 10);
        ctx.font = "12px 'Poppins', sans-serif";
        ctx.fillStyle = "#6b7280";
        ctx.fillText("Best-Selling Products", width / 2, height / 2 + 15);
        ctx.restore();
      },
    };

    // ✅ Create new chart
    window.bestSellingChart = new Chart(ctx, {
      type: "doughnut",
      data: chartData,
      options: {
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
      },
      plugins: [centerTextPlugin],
    });

    // ✅ Build legend
    const legend = document.getElementById("productLegend");
    legend.innerHTML = "";
    products.forEach((p, i) => {
      legend.insertAdjacentHTML(
        "beforeend",
        `
        <div class="d-flex align-items-center mb-2">
          <span class="me-2" style="width:10px; height:10px; background:${colors[i]}; border-radius:50%;"></span>
          <img src="${p.image}" width="30" height="30" class="rounded me-2" alt="${p.name}">
          <span class="fw-semibold">${p.name}</span>
          <span class="ms-auto text-muted">${formatK(p.quantity)}</span>
        </div>
        `
      );
    });
  } catch (err) {
    console.error("Error loading best-selling products:", err);
  }
}
function formatK(num) {
  return num >= 1000 ? (num / 1000).toFixed(1) + "k" : num;
}














function logOut() {
  Swal.fire({
    title: 'Are you sure?',
    text: "You will be logged out of your account.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085D6',
    confirmButtonText: 'Yes, log me out',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      // :siren: Clear stored login data
      localStorage.removeItem("key");
      localStorage.removeItem("role");
      localStorage.removeItem("customerid");
      localStorage.removeItem("customerloginid");
      localStorage.removeItem("city");
      Swal.fire({
        icon: 'success',
        title: 'Logged out',
        text: 'You have been successfully logged out.',
        confirmButtonColor: '#28A745'
      }).then(() => {
        location.href = "signin.html"; // redirect to login page
      });
    }
  });
}