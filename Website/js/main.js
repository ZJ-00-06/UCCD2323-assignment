/* =========================================
   1. UTILITIES & THEME MANAGEMENT
========================================= */

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function initTheme() {
    const themeToggleBtn = document.getElementById("themeToggle");
    const body = document.body;

    const savedTheme = getCookie("siteTheme");
    if (savedTheme === "light") {
        body.classList.add("light-mode");
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            body.classList.toggle("light-mode");
            const isLight = body.classList.contains("light-mode");
            setCookie("siteTheme", isLight ? "light" : "dark", 30);
        });
    }
}


/* =========================================
   2. AUTHENTICATION (Sign In, Sign Up, Sign Out)
========================================= */


function logoutUser() {
    
    localStorage.removeItem("current_user");
    localStorage.removeItem("loggedInUser"); 
    
    
    if (window.location.pathname.includes("auth.html")) {
        window.location.reload();
    } else {
        window.location.href = "index.html";
    }
}

function initAuthForms() {
    const signUpForm = document.getElementById("signUpForm");
    const signInForm = document.getElementById("signInForm");

    // --- Sign Up Logic ---
    if (signUpForm) {
        signUpForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const fullName = document.getElementById("signupNameInput")?.value.trim();
            const email = document.getElementById("signupEmailInput")?.value.trim().toLowerCase();
            const password = document.getElementById("signupPasswordInput")?.value.trim();
            const gender = document.getElementById("signupGenderInput")?.value;
            const dob = document.getElementById("signupDobInput")?.value;

            if (!fullName || !email || !password) {
                alert("Please fill in all required fields!");
                return;
            }

            if (password.length < 6) {
                alert("Password must be at least 6 characters long!");
                return;
            }

            let users = JSON.parse(localStorage.getItem("ai_club_users")) || [];

            
            const existingUser = users.find(user => 
                user.email === email || user.fullName.toLowerCase() === fullName.toLowerCase()
            );

            if (existingUser) {
                alert("Registration failed: Username or Email is already registered.");
                return;
            }

            
            const newUser = { fullName, email, password, gender, dob };
            users.push(newUser);
            localStorage.setItem("ai_club_users", JSON.stringify(users));

            
            localStorage.setItem("current_user", JSON.stringify(newUser));
            alert("Registration successful! Redirecting...");
            window.location.href = "index.html";
        });
    }

    // --- Sign In Logic ---
    if (signInForm) {
        signInForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const inputIdentifier = document.getElementById("signInNameInput")?.value.trim().toLowerCase();
            const inputPassword = document.getElementById("signInPasswordInput")?.value.trim();

            let users = JSON.parse(localStorage.getItem("ai_club_users")) || [];

            
            const matchedUser = users.find(user =>
                (user.fullName.toLowerCase() === inputIdentifier || user.email.toLowerCase() === inputIdentifier) &&
                user.password === inputPassword
            );

            if (matchedUser) {
                alert(`Welcome back, ${matchedUser.fullName}!`);
                localStorage.setItem("current_user", JSON.stringify(matchedUser));
                window.location.href = "index.html";
            } else {
                alert("Login failed: Incorrect username/email or password.");
            }
        });
    }
}


/* =========================================
   3. UI & NAVBAR STATE MANAGEMENT
========================================= */

function updateNavigationUI() {
    const currentUserRaw = localStorage.getItem("current_user");
    let currentUser = null;

    try {
        currentUser = JSON.parse(currentUserRaw);
    } catch (e) {
        currentUser = null;
    }

    const userAuthBtn = document.getElementById("userAuthBtn");
    const authContainer = document.getElementById("authContainer");
    const userProfileCard = document.getElementById("userProfileCard");
    const loggedInUserDisplay = document.getElementById("loggedInUserDisplay");
    const signOutBtn = document.getElementById("signOutBtn");

    if (currentUser && currentUser.fullName) {
        // 1. Login Status: Display the Profile area, hide the login/registration form.
        if (authContainer) authContainer.classList.add("d-none");
        if (userProfileCard) userProfileCard.classList.remove("d-none");
        if (loggedInUserDisplay) loggedInUserDisplay.textContent = currentUser.fullName;

        // 2. Change the state of the Navbar buttons
        if (userAuthBtn) {
            userAuthBtn.textContent = `HI, ${currentUser.fullName.toUpperCase()}`;
            userAuthBtn.classList.remove("btn-outline-info");
            userAuthBtn.classList.add("btn-info", "text-dark");
            
            // Clicking the Navbar button will directly bring up a logout confirmation box.
            userAuthBtn.onclick = (e) => {
                e.preventDefault();
                if (confirm("Do you want to log out?")) {
                    logoutUser();
                }
            };
        }
    } else {
        // Not logged in: Display login/registration form, hide Profile card.
        if (authContainer) authContainer.classList.remove("d-none");
        if (userProfileCard) userProfileCard.classList.add("d-none");

        if (userAuthBtn) {
            userAuthBtn.textContent = "SIGN IN / SIGN UP";
            userAuthBtn.href = "signin.html";
            userAuthBtn.classList.remove("btn-info", "text-dark");
            userAuthBtn.classList.add("btn-outline-info");
            userAuthBtn.onclick = null;
        }
    }

    // Bind the Sign Out button click event
    if (signOutBtn) {
        signOutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            logoutUser();
        });
    }
}


/* =========================================
   4. APP INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initAuthForms();
    updateNavigationUI();
});