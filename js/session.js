// Session management for access control
const PROTECTED_PAGES = [
    'login.html',
    'register.html',
    'dashboard.html',
    'profile.html'
];

const PUBLIC_PAGES = [
    'index.html',
    'shop.html',
    'about.html',
    'contact.html',
    'subscribe.html'
];

// Check if current page requires authentication
function checkPageAccess() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // If it's a protected page, verify payment
    if (PROTECTED_PAGES.includes(currentPage)) {
        verifyPaymentStatus();
    }
}

// Verify payment status
function verifyPaymentStatus() {
    const paymentVerified = localStorage.getItem('paymentVerified');
    const paymentTimestamp = localStorage.getItem('paymentTimestamp');
    
    // Check if payment is verified and not expired (24 hours)
    if (paymentVerified === 'true' && paymentTimestamp) {
        const now = new Date().getTime();
        const paymentTime = parseInt(paymentTimestamp);
        const hoursSincePayment = (now - paymentTime) / (1000 * 60 * 60);
        
        if (hoursSincePayment < 24) {
            return true;
        } else {
            // Payment expired
            localStorage.removeItem('paymentVerified');
            localStorage.removeItem('paymentTimestamp');
            redirectToSubscribe();
            return false;
        }
    } else {
        redirectToSubscribe();
        return false;
    }
}

// Redirect to subscribe page
function redirectToSubscribe() {
    if (!window.location.pathname.includes('subscribe.html')) {
        window.location.href = 'subscribe.html';
    }
}

// Initialize session
function initSession() {
    if (!localStorage.getItem('sessionId')) {
        localStorage.setItem('sessionId', Math.random().toString(36).substring(2, 15));
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    initSession();
    checkPageAccess();
}); 