var loginKeyListenerAdded = false;
var signupKeyListenerAdded = false;
function includeHTML() {
    const elements = document.querySelectorAll('[data-include]');
    elements.forEach(el => {
        const file = el.getAttribute('data-include');
        fetch(file)
            .then(response => {
                if (!response.ok) throw new Error('File not found: ' + file);
                return response.text();
            })
            .then(data => {
                el.innerHTML = data;
                el.classList.add('loaded'); // Mark as loaded to remove skeleton
                updateAuthUI();
                addLoginEnterKeyListener();
                addSignupEnterKeyListener();
            })
            .catch(err => console.error(err));
    });
}

document.addEventListener("DOMContentLoaded", includeHTML);

// Modal handling functions
function openLogin() {
    document.getElementById("loginModal").style.display = "flex";
}

function openSignup() {
    document.getElementById("signupModal").style.display = "flex";
}

function openProfile() {
    getUserDetails();
    const name = sessionStorage.getItem("userName");
    const email = sessionStorage.getItem("userEmail");

    if (name && email) {
        document.getElementById("profileName").textContent = name;
        document.getElementById("profileEmail").textContent = email;
    }

    document.getElementById("profileModal").style.display = "flex";
}

function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

function switchModal(hideId, showId) {
    closeModal(hideId);
    document.getElementById(showId).style.display = "flex";
}

window.onclick = function (event) {
    const modals = ["loginModal", "signupModal", "profileModal"];
    modals.forEach(id => {
        const modal = document.getElementById(id);
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
}

function isAuthenticated() {
    return !!sessionStorage.getItem("jwtToken");
}

function authFetch(url, options = {}) {
    const token = sessionStorage.getItem("jwtToken");
    const headers = Object.assign({}, options.headers || {});
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }
    return fetch(url, Object.assign({}, options, { headers }));
}

function navigateIfLoggedIn(targetUrl) {
    if (isAuthenticated()) {
        window.location.href = targetUrl;
    } else {
        sessionStorage.setItem("redirectAfterLogin", targetUrl);
        openLogin();
    }
}

function submitLogin() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    setButtonLoading('loginButton', true, 'Logging in');

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password })
    })
        .then(response => {
            if (response.ok) {
                return response.json().then(data => {
                    sessionStorage.setItem("jwtToken", data.token);
                    updateAuthUI();
                    const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "/";
                    sessionStorage.removeItem("redirectAfterLogin");
                    showSpinner();
                    window.location.href = redirectUrl;
                });
            } else if (response.status === 401) {
                showToast("Invalid email or password", "error");
            } else {
                showToast("Something went wrong during login", "error");
            }
        })
        .catch(err => {
            console.error("Login error:", err);
            showToast("Something went wrong", "error");
        })
        .finally(() => {
            setButtonLoading('loginButton', false, 'Login');
        });
}

function logout() {
    sessionStorage.removeItem("jwtToken");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userEmail");
    updateAuthUI();
    window.location.href = "/";
}

function updateAuthUI() {
    if (isAuthenticated() && (!sessionStorage.getItem("userName") || !sessionStorage.getItem("userEmail"))) {
        getUserDetails();
    }
    const isLoggedIn = isAuthenticated();

    const loginBtn = document.getElementById("loginLink");
    const signupBtn = document.getElementById("signupLink");
    const profileBtn = document.getElementById("profileLink");

    if (isLoggedIn) {
        if (loginBtn) loginBtn.style.display = "none";
        if (signupBtn) signupBtn.style.display = "none";
        if (profileBtn) profileBtn.style.display = "inline-block";
        checkDraftsVisibility();
    } else {
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (signupBtn) signupBtn.style.display = "inline-block";
        if (profileBtn) profileBtn.style.display = "none";
        const draftsBtn = document.getElementById("draftsNavBtn");
        if (draftsBtn) draftsBtn.style.display = "none";
    }
}

function checkDraftsVisibility() {
    const draftsBtn = document.getElementById("draftsNavBtn");
    if (!draftsBtn) return;

    authFetch("/getDrafts")
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return [];
            }
        })
        .then(drafts => {
            if (drafts.length > 0) {
                draftsBtn.style.display = "inline-block";
            } else {
                draftsBtn.style.display = "none";
            }
        })
        .catch(err => {
            console.error("Error checking drafts:", err);
            draftsBtn.style.display = "none";
        });
}

const ROUTES = {
    dashboard: '/templates/dashboard.html',
    addTrade: '/templates/add-trade.html',
    history: '/templates/trade-history.html',
};

function submitSignup() {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirm").value;
    setButtonLoading('signupButton', true, 'Signing up');

    if (!name || !email || !password || !confirmPassword) {
        showToast("Please fill in all fields", "error");
        setButtonLoading('signupButton', false, 'Sign Up');
        return;
    }

    if (!email.endsWith("@gmail.com")) {
        showToast("Email must end with '@gmail.com'", "error");
        setButtonLoading('signupButton', false, 'Sign Up');
        return;
    }

    if (password.length < 8) {
        showToast("Password must be at least 8 characters long", "error");
        setButtonLoading('signupButton', false, 'Sign Up');
        return;
    }
    if (!/[A-Z]/.test(password)) {
        showToast("Password must include at least one uppercase letter", "error");
        setButtonLoading('signupButton', false, 'Sign Up');
        return;
    }
    if (!/[a-z]/.test(password)) {
        showToast("Password must include at least one lowercase letter", "error");
        setButtonLoading('signupButton', false, 'Sign Up');
        return;
    }
    if (!/\d/.test(password)) {
        showToast("Password must include at least one number", "error");
        setButtonLoading('signupButton', false, 'Sign Up');
        return;
    }
    if (!/[@$!%*?&]/.test(password)) {
        showToast("Password must include at least one special character (e.g., @$!%*?&)", "error");
        setButtonLoading('signupButton', false, 'Sign Up');
        return;
    }

    if (password !== confirmPassword) {
        showToast("Passwords do not match", "error");
        setButtonLoading('signupButton', false, 'Sign Up');
        return;
    }

    fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    })
        .then(response => {
            if (response.ok) {
                showToast("Registration successful! Please log in", "success");
                switchModal("signupModal", "loginModal");
            } else if (response.status === 409) {
                showToast("A user with this email already exists", "error");
            } else {
                showToast("Registration failed. Please try again", "error");
            }
        })
        .catch(err => {
            console.error("Error during signup:", err);
            showToast("Something went wrong. Please try again", "error");
        })
        .finally(() => {
            setButtonLoading('signupButton', false, 'Sign Up');
        });
}

function resetSignupButton() {
    const signupButton = document.getElementById("signupButton");
    if (signupButton) {
        signupButton.disabled = false;
        signupButton.textContent = "Sign Up";
    }
}

function addLoginEnterKeyListener() {
    if (loginKeyListenerAdded) return;

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    if (!emailInput || !passwordInput) return;

    loginKeyListenerAdded = true;

    const handleEnterKey = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            submitLogin();
        }
    };

    emailInput.addEventListener("keydown", handleEnterKey);
    passwordInput.addEventListener("keydown", handleEnterKey);
}

function addSignupEnterKeyListener() {
    if (signupKeyListenerAdded) return;

    const nameInput = document.getElementById("signupName");
    const emailInput = document.getElementById("signupEmail");
    const passwordInput = document.getElementById("signupPassword");
    const confirmInput = document.getElementById("signupConfirm");

    if (!nameInput || !emailInput || !passwordInput || !confirmInput) return;

    signupKeyListenerAdded = true;

    const handleEnterKey = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            submitSignup();
        }
    };

    nameInput.addEventListener("keydown", handleEnterKey);
    emailInput.addEventListener("keydown", handleEnterKey);
    passwordInput.addEventListener("keydown", handleEnterKey);
    confirmInput.addEventListener("keydown", handleEnterKey);
}

function getUserDetails() {
    authFetch("/getUserDetails", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Failed to fetch user details");
            }
        })
        .then(data => {
            sessionStorage.setItem("userName", data.name);
            sessionStorage.setItem("userEmail", data.email);
            //            updateAuthUI();
        })
        .catch(err => {
            console.error("Error fetching user details:", err);
        });
}

// ========== UTILITY FUNCTIONS ==========

// Show/hide global spinner
function showSpinner() {
    const spinner = document.getElementById('globalSpinner');
    if (spinner) spinner.classList.add('active');
}

function hideSpinner() {
    const spinner = document.getElementById('globalSpinner');
    if (spinner) spinner.classList.remove('active');
}

// Show inline button loader
function setButtonLoading(buttonId, loading, originalText = 'Submit') {
    const button = document.getElementById(buttonId);
    if (!button) return;

    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML; // Store original text
        button.innerHTML = originalText + ' <span class="btn-loader"></span>';
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || originalText;
    }
}

// Toast notification system
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.warn('Toast container not found');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon"></div>
        <div class="toast-message">${message}</div>
        <div class="toast-close" onclick="this.parentElement.remove()">×</div>
    `;

    container.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}