// auth.js
// Put this in a file and include it on every protected page (dashboard.html, orders.html, etc.)

(function () {
  // Replace with the path to your custom page
  const SESSION_EXPIRED_PATH = "/session-expired.html"; 

  // Check if user is authenticated (simple localStorage check as per your flow)
  function isAuthenticated() {
    const token = localStorage.getItem("token");
    // optionally: validate token format quickly (not full verification)
    return Boolean(token && token.length > 10);
  }

  // Redirect to the session expired page
  function redirectToSessionExpired() {
    // Use replace so this redirect does not create a new history entry
    // (prevents back button from landing back on the protected page)
    window.location.replace(SESSION_EXPIRED_PATH);
  }

  // Main auth checker
  function checkAuth() {
    if (!isAuthenticated()) {
      redirectToSessionExpired();
    }
  }

  // Run immediately (fast)
  checkAuth();

  // Also run on pageshow (handles bfcache/back-button on mobile)
  window.addEventListener("pageshow", (event) => {
    // Some browsers keep a persisted page (bfcache). Always re-check auth.
    checkAuth();
  });

  // Optional: prevent caching via history manipulation on load
  // (this makes back/forward behavior more predictable)
  window.addEventListener("load", () => {
    try {
      // Replace current history entry with itself so back-stack is cleaner
      history.replaceState(null, document.title, location.href);
    } catch (e) {
      // ignore (some browsers restrict replaceState in certain contexts)
    }
  });

  // Expose helper if other scripts want to call it
  window.__auth = {
    isAuthenticated,
    checkAuth,
    redirectToSessionExpired,
  };
})();
