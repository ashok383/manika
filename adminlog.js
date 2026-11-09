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
    if (adminAuth === "true" && adminLoginTime) {
        let elapsedTime = Date.now() - parseInt(adminLoginTime);
        if (elapsedTime < ADMIN_TIMEOUT) {
            // Refresh session timestamp and open admin page directly
            sessionStorage.setItem("manikarnika_admin_login_time", Date.now());
            window.location.href = "index.html";
            return;
        } else {
            // Session expired, clear old tokens
            sessionStorage.removeItem("manikarnika_admin_authenticated");
            sessionStorage.removeItem("manikarnika_admin_login_time");
        }
    }

    // Prompt for Admin Password/PIN if not authenticated
    let pin = prompt("🔐 Enter Admin Password / PIN to access Admin Panel:");
    
    // User clicked cancel on prompt
    if (pin === null) {
        return;
    }

    // Clean input and validate password (supports 'admin123' and supervisor PIN '7680')
    if (pin.trim() === "admin123" || pin.trim() === "7680") {
        sessionStorage.setItem("manikarnika_admin_authenticated", "true");
        sessionStorage.setItem("manikarnika_admin_login_time", Date.now());
        
        alert("🔒 Admin Authentication Successful! Opening Dashboard...");
        
        // Redirect to the protected admin HTML file
        window.location.href = "adminlog.html";
    } else {
        alert("❌ Incorrect Admin Password!");
    }
}
