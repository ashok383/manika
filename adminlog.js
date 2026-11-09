/**
 * ==================================================
 * ADMIN LOG / SECURE ADMIN AUTHENTICATION & REDIRECT
 * ==================================================
 */

const ADMIN_TIMEOUT = 10 * 60 * 1000; // 10 minutes admin session limit

function adminlog() {
    let adminAuth = sessionStorage.getItem("manikarnika_admin_authenticated");
    let adminLoginTime = sessionStorage.getItem("manikarnika_admin_login_time");

    // Check if session is valid and hasn't expired
    if (adminAuth === "true" && adminLoginTime && (Date.now() - adminLoginTime < ADMIN_TIMEOUT)) {
        // Refresh session timestamp and open admin page directly
        sessionStorage.setItem("manikarnika_admin_login_time", Date.now());
        window.location.href = "admin-dashboard.html";
        return;
    }

    // Prompt for Admin Password/PIN if not authenticated
    let pin = prompt("🔐 Enter Admin Password / PIN to access Admin Panel:");
    
    // Replace '7680' or 'admin123' with your secure admin passcode
    if (pin === "7680" || pin === "admin123") {
        sessionStorage.setItem("manikarnika_admin_authenticated", "true");
        sessionStorage.setItem("manikarnika_admin_login_time", Date.now());
        
        alert("🔒 Admin Authentication Successful! Opening Dashboard...");
        
        // Redirect to the protected admin HTML file
        window.location.href = "admin-dashboard.html";
    } else {
        if (pin !== null) {
            alert("❌ Incorrect Admin Password!");
        }
    }
}
