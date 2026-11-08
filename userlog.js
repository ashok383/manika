/**
 * ==================================================
 * MANIK_A_RNIKA - User Log Module (userlog.js)
 * ==================================================
 */

/**
 * Main function triggered by the User Log button.
 * Validates user session/login and opens the user logging interface.
 */
function userlog() {
    console.log("User log triggered...");

    // Check if user session exists; if not, prompt for username/login or initialize
    if (!checkUserSession()) {
        const username = prompt("Enter User Name or ID:");
        if (!authenticateUser(username)) {
            alert("Access Denied: Invalid user.");
            return;
        }
    }

    // Proceed to open or fetch user logs
    loadUserDashboard();
}

/**
 * Checks if a valid user session exists in local storage.
 * @returns {boolean}
 */
function checkUserSession() {
    return localStorage.getItem("manik_user_authenticated") === "true";
}

/**
 * Simple authentication stub for users (Replace with backend verification as needed).
 * @param {string} username 
 * @returns {boolean}
 */
function authenticateUser(username) {
    if (username && username.trim() !== "") {
        localStorage.setItem("manik_user_authenticated", "true");
        localStorage.setItem("manik_current_user", username.trim());
        return true;
    }
    return false;
}

/**
 * Loads and displays the user activity logs.
 */
function loadUserDashboard() {
    // Option A: Redirect to a dedicated user log page if it exists
    // window.location.href = 'user-dashboard.html';

    // Option B: Fallback alert or custom modal initialization
    const currentUser = localStorage.getItem("manik_current_user") || "User";
    alert(`Welcome back, ${currentUser}! Loading user activity logs...`);
}

// Export or attach to global scope
window.userlog = userlog;
