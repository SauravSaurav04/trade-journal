var loginKeyListenerAdded = false;
var signupKeyListenerAdded = false;
// Include HTML content dynamically
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

// Close modal if clicked outside
window.onclick = function(event) {
    const modals = ["loginModal", "signupModal", "profileModal"];
    modals.forEach(id => {
        const modal = document.getElementById(id);
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
}

function isAuthenticated() {
    return sessionStorage.getItem("isLoggedIn") === "true";
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
    const loginButton = document.getElementById("loginButton");

    if (loginButton) {
        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";
    }

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    })
    .then(response => {
        if (response.status === 200 || response.redirected) {
            sessionStorage.setItem("isLoggedIn", "true");
            updateAuthUI();
            const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "/";
            sessionStorage.removeItem("redirectAfterLogin");
            window.location.href = redirectUrl;
        } else if (response.status === 401) {
            alert("Invalid email or password.");
        } else {
            alert("Something went wrong during login.");
        }
    })
    .catch(err => {
        console.error("Login error:", err);
        alert("Something went wrong.");
    })
    .finally(() => {
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = "Login";
        }
    });
}

function logout() {
    fetch("/logout", { method: "POST" }).then(() => {
        sessionStorage.removeItem("isLoggedIn");
        updateAuthUI();
        window.location.href = "/";
    });
}

function updateAuthUI() {
    getUserDetails();
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

    const loginBtn = document.getElementById("loginLink");
    const signupBtn = document.getElementById("signupLink");
    const profileBtn = document.getElementById("profileLink");

    if (isLoggedIn) {
        if (loginBtn) loginBtn.style.display = "none";
        if (signupBtn) signupBtn.style.display = "none";
        if (profileBtn) profileBtn.style.display = "inline-block";
    } else {
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (signupBtn) signupBtn.style.display = "inline-block";
        if (profileBtn) profileBtn.style.display = "none";
    }
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
    const signupButton = document.getElementById("signupButton");

    if (signupButton) {
        signupButton.disabled = true;
        signupButton.textContent = "Signing up...";
    }

    if (!name || !email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        resetSignupButton();
        return;
    }

    if (!email.endsWith("@gmail.com")) {
        alert("Email must end with '@gmail.com'.");
        resetSignupButton();
        return;
    }

    if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        resetSignupButton();
        return;
    }
    if (!/[A-Z]/.test(password)) {
        alert("Password must include at least one uppercase letter.");
        resetSignupButton();
        return;
    }
    if (!/[a-z]/.test(password)) {
        alert("Password must include at least one lowercase letter.");
        resetSignupButton();
        return;
    }
    if (!/\d/.test(password)) {
        alert("Password must include at least one number.");
        resetSignupButton();
        return;
    }
    if (!/[@$!%*?&]/.test(password)) {
        alert("Password must include at least one special character (e.g., @$!%*?&).");
        resetSignupButton();
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        resetSignupButton();
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
            alert("Registration successful! Please log in.");
            switchModal("signupModal", "loginModal");
        } else if (response.status === 409) {
            alert("A user with this email already exists.");
        } else {
            alert("Registration failed. Please try again.");
        }
    })
    .catch(err => {
        console.error("Error during signup:", err);
        alert("Something went wrong. Please try again.");
    })
    .finally(() => {
        resetSignupButton();
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
    loginKeyListenerAdded = true;

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    if (!emailInput || !passwordInput) return;

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
    signupKeyListenerAdded = true;

    const nameInput = document.getElementById("signupName");
    const emailInput = document.getElementById("signupEmail");
    const passwordInput = document.getElementById("signupPassword");
    const confirmInput = document.getElementById("signupConfirm");

    if (!nameInput || !emailInput || !passwordInput || !confirmInput) return;

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
    fetch("/getUserDetails", {
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
        updateAuthUI();
    })
    .catch(err => {
        console.error("Error fetching user details:", err);
    });
}