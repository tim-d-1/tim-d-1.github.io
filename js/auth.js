// TODO: SECURE PAGE

const authForm = document.getElementById("auth-form");
const loginPage = document.getElementById("login-page");
const app = document.getElementById("app");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const toggleText = document.getElementById("toggle-text");
const toggleLink = document.getElementById("toggle-link");

let isLogin = true;

if (localStorage.getItem("userSession")) {
    showApp();
    loginPage.classList.add("hidden");
} else {
    loginPage.classList.remove("hidden");
}

authForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value.trim();

    if (!email || pass.length < 6) {
        return alert("Invalid credentials");
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (isLogin) {
        const user = users.find(u => u.email === email && u.pass === pass);
        if (!user) return alert("Incorrect email or password");

        localStorage.setItem("userSession", JSON.stringify(user));
        showApp();
    } else {
        if (users.some(u => u.email === email)) {
            return alert("User already exists");
        }
        users.push({ email, pass });
        localStorage.setItem("users", JSON.stringify(users));

        alert("Signup successful! You can now login.");
        switchMode(true);
    }
});

toggleLink.addEventListener("click", e => {
    e.preventDefault();
    switchMode(!isLogin);
});

function switchMode(login) {
    isLogin = login;
    formTitle.textContent = login ? "Login" : "Sign Up";
    submitBtn.textContent = login ? "Login" : "Sign Up";
    toggleText.textContent = login
        ? "Don't have an account?"
        : "Already have an account?";
    toggleLink.textContent = login ? "Sign up" : "Login";
}

function showApp() {
    loginPage.classList.add("hidden");
    app.classList.remove("hidden");
    app.style.display = "block";
}

function logout() {
    localStorage.removeItem("userSession");
    location.reload();
}
