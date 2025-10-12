
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


// function toggleNotification(event) {
//   event.preventDefault();
//   event.stopPropagation(); // stop click bubbling

//   // detect viewport (mobile vs desktop)
//   const isMobile = window.innerWidth < 768;

//   // pick the right popup
//   const popup = document.getElementById(isMobile ? 'notificationPopUp1' : 'notificationPopUp');

//   // toggle visibility
//   if (popup.style.display === 'none' || popup.style.display === '') {
//     popup.style.display = 'block';
//   } else {
//     popup.style.display = 'none';
//   }

//   // hide the other one (if open)
//   const otherPopup = document.getElementById(isMobile ? 'notificationPopUp' : 'notificationPopUp1');
//   if (otherPopup) otherPopup.style.display = 'none';
// }

// hide both when clicking outside

function toggleNotification(event) {
  event.preventDefault();
  event.stopPropagation(); // stop click bubbling

  // detect viewport (mobile vs desktop)
  const isMobile = window.innerWidth < 768;

  // pick the right popup
  const popup = document.getElementById(isMobile ? 'notificationPopUp1' : 'notificationPopUp');

  // toggle visibility
  const isHidden = popup.style.display === 'none' || popup.style.display === '';
  popup.style.display = isHidden ? 'block' : 'none';

  // hide the other one (if open)
  const otherPopup = document.getElementById(isMobile ? 'notificationPopUp' : 'notificationPopUp1');
  if (otherPopup) otherPopup.style.display = 'none';

  // ✅ Mark all notifications as seen when the popup is opened
  if (isHidden) {
    const badges = [
      document.getElementById('notificationBadge'),
      document.getElementById('notificationBadge1'),
    ];

    // hide both badges visually
    badges.forEach((badge) => {
      if (badge) {
        badge.style.transition = 'opacity 0.3s';
        badge.style.opacity = 0;
        setTimeout(() => (badge.style.display = 'none'), 300);
      }
    });

    // update last seen time
    localStorage.setItem('lastSeenOrderTime', new Date().toISOString());
  }
}










document.addEventListener('click', function (e) {
  const popup1 = document.getElementById('notificationPopUp');
  const popup2 = document.getElementById('notificationPopUp1');

  if (!e.target.closest('#notificationPopUp') &&
      !e.target.closest('#notificationPopUp1') &&
      !e.target.closest('.fa-bell')) {
    if (popup1) popup1.style.display = 'none';
    if (popup2) popup2.style.display = 'none';
  }
});

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

  // LOAD BEST SELLING PRODUCT TO  DASHBOARD
async function loadProducts() {
  const tbody = document.querySelector("#TableId tbody");
  if (!tbody) return; // <-- safe guard

  try {
    const response = await fetch("http://localhost:3001/amazon/document/api/products");
    if (!response.ok) throw new Error("Failed to fetch products");
    const products = await response.json();

    tbody.innerHTML = ""; // clear table first
    products.forEach(product => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.category?.name || "N/A"}</td>
        <td>${product.numberInStock}</td>
        <td>₦${Number(product.price).toLocaleString()}</td>
        <td><span class="badge bg-success">Paid</span></td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadProducts);



// function to load customers(CUSTOMER.HTML RENDERING) by distributor location 

document.addEventListener("DOMContentLoaded", () => {
  let allUsers = [];   // store all unique users
  let currentPage = 1;
  const pageSize = 2;  // rows per page

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

      const tbody = document.getElementById("usersTableBody");
      if (!tbody) return console.error("❌ Missing <tbody id='usersTableBody'> in HTML");

      if (filteredOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">
          No users found for ${distributorCity}</td></tr>`;
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
    if (!tbody) return console.error("❌ Missing usersTableBody element");
    tbody.innerHTML = "";

    const searchInput = document.getElementById("searchInput");
    const searchValue = (searchInput?.value || "").toLowerCase();

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
                <small style="color: #8D98AF; font-size: 10px;">
                  @${user.fullName.split(" ")[0].toLowerCase()}
                </small>
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

    const pageInfo = document.getElementById("pageInfo");
    if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
  }

  // Pagination & Search listeners
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const searchIcon = document.getElementById("searchIcon");
  const searchInput = document.getElementById("searchInput");

  if (prevBtn)
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) { currentPage--; renderTable(); }
    });

  if (nextBtn)
    nextBtn.addEventListener("click", () => {
      const totalPages = Math.ceil(allUsers.length / pageSize);
      if (currentPage < totalPages) { currentPage++; renderTable(); }
    });

  if (searchIcon)
    searchIcon.addEventListener("click", () => {
      searchInput.style.display = searchInput.style.display === "none" ? "inline-block" : "none";
      if (searchInput.style.display === "inline-block") searchInput.focus();
    });

  if (searchInput)
    searchInput.addEventListener("input", () => {
      currentPage = 1;
      renderTable();
    });

  // Load data on page ready
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
    if (!listContainer) return;
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
    if (!tbody) return;
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
let lastSeenOrderTime = localStorage.getItem("lastSeenOrderTime") 
  ? new Date(localStorage.getItem("lastSeenOrderTime")) 
  : new Date(0);

document.addEventListener("DOMContentLoaded", () => {
  loadCityOrdersFeed();

  // ✅ Bell click → mark as seen
  // document.body.addEventListener("click", (e) => {
  //   if (e.target.closest(".btnSharp")) {
  //     const badges = [
  //       document.getElementById("notificationBadge"),
  //       document.getElementById("notificationBadge1"),
  //     ];
  //     badges.forEach((badge) => {
  //       if (badge) badge.style.display = "none";
  //     });

  //     // Mark latest order time as seen
  //     localStorage.setItem("lastSeenOrderTime", new Date().toISOString());
  //   }
  // });

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

    const feeds = [
      document.getElementById("activityFeed"),
      document.getElementById("activityFeed1"),
    ];

    feeds.forEach((feed) => {
      if (!feed) return;
      feed.innerHTML = "";

      if (sortedOrders.length === 0) {
        feed.innerHTML = `<li class="text-muted text-center">No recent activity in ${distributorCity}</li>`;
        return;
      }

      // ✅ Show 5 recent
      sortedOrders.slice(0, 5).forEach((order) => {
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

      // ✅ Add “See all notifications” button (bottom)
      feed.insertAdjacentHTML(
        "beforeend",
        `
        <li class="text-center mt-2">
          <button class="btn btn-success w-100 fw-semibold" 
            onclick="window.location.href='notifications.html'">
            See all notifications
          </button>
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

// 🔔 Update notification badge (both desktop + mobile)
function updateNotificationBadge(count) {
  const badges = [
    document.getElementById("notificationBadge"),
    document.getElementById("notificationBadge1"),
  ];

  badges.forEach((badge) => {
    if (!badge) return;
    if (count > 0) {
      badge.style.display = "inline-block";
      badge.textContent = count > 9 ? "9+" : count;
    } else {
      badge.style.display = "none";
    }
  });
}


// =============================
// 📬 Full Notifications.html Page rendering
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("notificationsContainer");
  const pagination = document.getElementById("pagination");
  const paginationInfo = document.getElementById("paginationInfo");

  let allOrders = [];
  let currentPage = 1;
  const pageSize = 10;

  // ✅ Call directly (no nested DOMContentLoaded)
  loadNotifications();

  async function loadNotifications() {
    const distributorCity = localStorage.getItem("city");
    const lastSeenOrderTime = localStorage.getItem("lastSeenOrderTime")
      ? new Date(localStorage.getItem("lastSeenOrderTime"))
      : new Date(0);

    if (!distributorCity) {
      container.innerHTML =
        "<p class='text-muted'>City not found in localStorage.</p>";
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/amazon/document/api/orders");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Filter + sort newest first
      allOrders = data
        .filter(
          (o) =>
            o.customerSnapshot?.city?.toLowerCase() ===
            distributorCity.toLowerCase()
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (!allOrders.length) {
        container.innerHTML =
          "<p class='text-center text-muted my-3'>No notifications found.</p>";
        return;
      }

      renderPage(lastSeenOrderTime);
    } catch (err) {
      console.error("❌ Error loading notifications:", err);
      container.innerHTML =
        "<p class='text-danger'>Error loading notifications.</p>";
    }
  }

  function renderPage(lastSeenOrderTime) {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = allOrders.slice(start, end);

    if (!pageData.length) {
      container.innerHTML =
        "<p class='text-center text-muted my-3'>No notifications found.</p>";
      pagination.innerHTML = "";
      paginationInfo.textContent = "";
      return;
    }

    container.innerHTML = pageData
      .map((order) => {
    const firstName = order.customerSnapshot?.firstName || "Unknown";
    const lastName = order.customerSnapshot?.lastName
      ? order.customerSnapshot.lastName.charAt(0) + "."
      : "";
    const total = order.totalAmount ? order.totalAmount.toLocaleString() : "0";
    const payment = order.paymentStatus || "pending";
    const createdAt = new Date(order.createdAt);
    const timeAgo = formatTimeAgo(createdAt);
    const isUnread = createdAt > lastSeenOrderTime;
    const avatar = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`;

    // 🛍️ Build proper product string (from your DB schema)
    let products = "some products";
    if (Array.isArray(order.items) && order.items.length > 0) {
      const productList = order.items.map((item) => {
        const productName = item.name || "Product";
        const quantity = item.quantity || 1;
        return `${quantity} ${productName}`;
      });

      if (productList.length === 1) {
        products = productList[0];
      } else if (productList.length === 2) {
        products = productList.join(" and ");
      } else {
        products =
          productList.slice(0, -1).join(", ") +
          " and " +
          productList[productList.length - 1];
      }
    }

    return `
      <div class="notif-item ${isUnread ? "unread" : ""}">
        <div class="notif-left">
          <img src="${avatar}" class="rounded-circle" width="40" height="40" />
          <div>
            <div>
              <strong>${firstName} ${lastName}</strong> just ordered ${products}.
            </div>
            <div class="small text-muted text-capitalize">
              ₦${total} • ${payment}
            </div>
          </div>
        </div>
        <div class="notif-time">${timeAgo}</div>
      </div>
    `;
  })
  .join("");

    paginationInfo.textContent = `Showing ${start + 1}–${Math.min(
      end,
      allOrders.length
    )} of ${allOrders.length}`;

    renderPagination();
  }

  function renderPagination() {
    const totalPages = Math.ceil(allOrders.length / pageSize);
    pagination.innerHTML = "";

    const createPageItem = (page, label = page) => `
      <li class="page-item ${page === currentPage ? "active" : ""}">
        <a class="page-link" href="#" data-page="${page}">${label}</a>
      </li>
    `;

    // Prev button
    pagination.innerHTML += createPageItem(currentPage - 1, "&lt;");

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      pagination.innerHTML += createPageItem(i);
    }

    // Next button
    pagination.innerHTML += createPageItem(currentPage + 1, "&gt;");

    // Disable prev/next if at limits
    if (currentPage === 1)
      pagination.firstElementChild.classList.add("disabled");
    if (currentPage === totalPages)
      pagination.lastElementChild.classList.add("disabled");

    // Click events
    pagination.querySelectorAll("a").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const page = parseInt(btn.dataset.page);
        if (page > 0 && page <= totalPages && page !== currentPage) {
          currentPage = page;
          renderPage(new Date(localStorage.getItem("lastSeenOrderTime")));
        }
      })
    );
  }

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
    for (const i of intervals) {
      const count = Math.floor(seconds / i.seconds);
      if (count >= 1)
        return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
    }
    return "just now";
  }
});

// Best-selling products (donut) with year navigation and robust handling
document.addEventListener("DOMContentLoaded", () => {
  const yearLabel = document.getElementById("chartYear");
  if (!yearLabel) return;

  let currentYear = new Date().getFullYear();
  yearLabel.textContent = currentYear;

  // Set up arrows
  const leftArrow = document.querySelector(".fa-chevron-left");
  const rightArrow = document.querySelector(".fa-chevron-right");

  [leftArrow, rightArrow].forEach(el => el.style.cursor = "pointer");

  leftArrow.addEventListener("click", () => {
    currentYear--;
    yearLabel.textContent = currentYear;
    loadBestSellingProducts(currentYear);
  });

  rightArrow.addEventListener("click", () => {
    currentYear++;
    yearLabel.textContent = currentYear;
    loadBestSellingProducts(currentYear);
  });

  // Load current year by default
  loadBestSellingProducts(currentYear);
});

async function loadBestSellingProducts(year) {
  const canvas = document.getElementById("bestSellingChart");
  const legend = document.getElementById("productLegend");
  const ctx = canvas.getContext("2d");
  if (!canvas || !legend) return;

  // Clean up any previous chart
  if (window.bestSellingChart && typeof window.bestSellingChart.destroy === "function") {
    window.bestSellingChart.destroy();
  }

  legend.innerHTML = `<p class="text-muted text-center">Loading...</p>`;

  try {
    const distributorCity = localStorage.getItem("city");
    if (!distributorCity) {
      legend.innerHTML = `<p class="text-muted text-center">Distributor city not set</p>`;
      drawEmptyCenter(canvas, "0", "Best-Selling");
      return;
    }

    const res = await fetch("http://localhost:3001/amazon/document/api/orders");
    if (!res.ok) throw new Error("Failed to fetch orders");
    const orders = await res.json();

    // Filter by city & year
    const filteredOrders = orders.filter(
      (o) =>
        o.customerSnapshot?.city?.toLowerCase() === distributorCity.toLowerCase() &&
        new Date(o.createdAt).getFullYear() === year
    );

    if (!filteredOrders.length) {
      legend.innerHTML = `<p class="text-muted text-center">No data for ${year}</p>`;
      drawEmptyCenter(canvas, "0", `No data ${year}`);
      return;
    }

    // Aggregate product data
    const productMap = {};
    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        if (!productMap[item.name]) {
          productMap[item.name] = { quantity: 0, image: item.image || "" };
        }
        productMap[item.name].quantity += item.quantity || 0;
      });
    });

    const topProducts = Object.entries(productMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);

    const totalUnits = topProducts.reduce((sum, p) => sum + p.quantity, 0);
    const colors = ["#3b82f6", "#a855f7", "#22c55e", "#f97316"];

    // Draw chart
    const centerTextPlugin = {
      id: "centerText",
      afterDraw(chart) {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        const { left, right, top, bottom } = chartArea;
        const x = (left + right) / 2;
        const y = (top + bottom) / 2;

        ctx.save();
        ctx.font = "bold 22px 'Poppins', sans-serif";
        ctx.fillStyle = "#111827";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(totalUnits.toLocaleString(), x, y - 8);
        ctx.font = "11px 'Poppins', sans-serif";
        ctx.fillStyle = "#6b7280";
        ctx.fillText("Best-Selling", x, y + 14);
        ctx.restore();
      },
    };

    window.bestSellingChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: topProducts.map((p) => p.name),
        datasets: [
          {
            data: topProducts.map((p) => p.quantity),
            backgroundColor: colors.slice(0, topProducts.length),
            borderWidth: 0,
            cutout: "75%",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
      plugins: [centerTextPlugin],
    });

    // Render product legend
    legend.innerHTML = "";
    topProducts.forEach((p, i) => {
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
    legend.innerHTML = `<p class="text-muted text-center">Error loading data</p>`;
    drawEmptyCenter(canvas, "0", "Error");
  }
}

function drawEmptyCenter(canvas, main = "0", sub = "Best-Selling") {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const x = canvas.width / 2;
  const y = canvas.height / 2;
  ctx.save();
  ctx.font = "bold 22px 'Poppins', sans-serif";
  ctx.fillStyle = "#111827";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(main, x, y - 8);
  ctx.font = "11px 'Poppins', sans-serif";
  ctx.fillStyle = "#6b7280";
  ctx.fillText(sub, x, y + 14);
  ctx.restore();
}

function formatK(num) {
  return num >= 1000 ? (num / 1000).toFixed(1) + "k" : num.toString();
}


// SHOW CURRENT ACTIVE PAGE IN SIDEBAR
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll(".sidebar .nav-link");

  links.forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
});

// ========== Mobile Search Toggle & Logic ==========
document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("mobileSearchBtn");
  const searchInput = document.getElementById("mobileSearchInput");

  // Toggle search input visibility
  searchBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (searchInput.style.width === "0px" || searchInput.style.width === "") {
      searchInput.style.width = "180px";
      searchInput.style.opacity = "1";
      searchInput.focus();
    } else {
      searchInput.style.width = "0";
      searchInput.style.opacity = "0";
      searchInput.value = "";
      filterDashboardItems(""); // reset search
    }
  });

  // Search typing logic
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase().trim();
    filterDashboardItems(value);
  });
});

// ========== Dashboard Filter Function ==========
function filterDashboardItems(searchValue) {
  
  const rows = document.querySelectorAll("#ordersTableBody tr, #usersTableBody tr");
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchValue) ? "" : "none";
  });
}

// 🎯 Search dashboard content (orders, users, etc.)
// document.addEventListener("DOMContentLoaded", () => {
//   const mobileSearchInput = document.getElementById("mobileSearchBtn");

//   if (!mobileSearchInput) return;

//   mobileSearchInput.addEventListener("input", (e) => {
//     const searchValue = e.target.value.toLowerCase().trim();
//     filterDashboardItems(searchValue);
//   });
// });

// function filterDashboardItems(searchValue) {
//   // ✅ Adjust selectors to match your dashboard tables
//   const allRows = document.querySelectorAll("#ordersTableBody tr, #usersTableBody tr, #productsTableBody tr");

//   allRows.forEach((row) => {
//     const rowText = row.textContent.toLowerCase();
//     if (rowText.includes(searchValue)) {
//       row.style.display = "";
//     } else {
//       row.style.display = "none";
//     }
//   });
// }

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".search-container");
  const btn = document.getElementById("mobileSearchBtn");
  const input = document.getElementById("mobileSearchInput");

  if (!container || !btn || !input) return;

  // Expand / collapse input
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const isExpanded = container.classList.contains("expanded");
    if (!isExpanded) {
      container.classList.add("expanded");
      input.focus();
    } else {
      if (input.value.trim() !== "") {
        input.value = "";
        filterDashboardItems("");
        input.focus();
      } else {
        container.classList.remove("expanded");
      }
    }
  });

  // Live search while typing
  input.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase().trim();
    filterDashboardItems(value);
  });

  // Collapse when clicking outside
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target) && input.value.trim() === "") {
      container.classList.remove("expanded");
    }
  });

  // Collapse on blur if empty
  input.addEventListener("blur", () => {
    setTimeout(() => {
      if (input.value.trim() === "") {
        container.classList.remove("expanded");
      }
    }, 120);
  });
});

// 🧹 Normalize text for matching
function normalizeText(text) {
  return text.toLowerCase().replace(/₦|,|\s+/g, "").trim();
}

// 🕵️ Main dashboard filter logic
function filterDashboardItems(searchValue) {
  const cleanSearch = normalizeText(searchValue);
  const tables = document.querySelectorAll("table");
  const metricCards = document.querySelectorAll(".metric-card");
  const customerItems = document.querySelectorAll("#customerList > div");

  // Remove old “no results” if any
  let existingMsg = document.getElementById("noResultsMsg");
  if (existingMsg) existingMsg.remove();

  let resultsFound = false;

  // Reset everything when input empty
  if (cleanSearch === "") {
    tables.forEach((t) => t.querySelectorAll("tr").forEach((tr) => (tr.style.display = "")));
    metricCards.forEach((c) => (c.style.display = ""));
    customerItems.forEach((d) => (d.style.display = ""));
    return;
  }

  // ✅ Filter metric cards
  metricCards.forEach((card) => {
    const text = normalizeText(card.textContent);
    const visible = text.includes(cleanSearch);
    card.style.display = visible ? "" : "none";
    if (visible) resultsFound = true;
  });

  // ✅ Filter customer list
  customerItems.forEach((div) => {
    const text = normalizeText(div.textContent);
    const visible = text.includes(cleanSearch);
    div.style.display = visible ? "" : "none";
    if (visible) resultsFound = true;
  });

  // ✅ Filter all tables
  tables.forEach((table) => {
    const headers = Array.from(table.querySelectorAll("thead th"))
      .map((th) => normalizeText(th.textContent))
      .join(" ");
    const rows = table.querySelectorAll("tbody tr");

    let tableHasMatch = false;
    rows.forEach((tr) => {
      const rowText = normalizeText(tr.textContent);
      const visible = rowText.includes(cleanSearch) || headers.includes(cleanSearch);
      tr.style.display = visible ? "" : "none";
      if (visible) {
        tableHasMatch = true;
        resultsFound = true;
      }
    });

    // If no rows matched but header matches, show table anyway
    if (!tableHasMatch && headers.includes(cleanSearch)) {
      rows.forEach((tr) => (tr.style.display = ""));
      resultsFound = true;
    }
  });

  // 🚫 Show “No results found” overlay
  if (!resultsFound) {
    const msg = document.createElement("div");
    msg.id = "noResultsMsg";
    msg.textContent = "No results found";
    Object.assign(msg.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "rgba(255,255,255,0.95)",
      padding: "15px 25px",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      fontWeight: "500",
      color: "#444",
      zIndex: "2000",
    });
    document.body.appendChild(msg);

    // Auto-remove message after 2 seconds
    setTimeout(() => {
      if (msg && msg.parentNode) msg.remove();
    }, 2000);
  }
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
      // 🧹 Clear stored login/session data
      localStorage.removeItem("token");
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
        // 🚪 Redirect to session expired page (not login)
        window.location.replace("auth.html");
      });
    }
  });
}