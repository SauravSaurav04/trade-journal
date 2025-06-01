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

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    })
    .then(response => {
        if (response.status === 200 || response.redirected) {
            sessionStorage.setItem("userName", email);
            sessionStorage.setItem("userEmail", email);
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

    if (!name || !email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
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
    });
}
