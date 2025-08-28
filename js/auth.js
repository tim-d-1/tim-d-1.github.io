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
} else {
    loginPage.classList.remove("hidden");
    app.classList.add("hidden");
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
        location.reload();
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
    document.getElementById("app").innerHTML =
        `
    
        <aside class="col-2 sidebar h-100 p-3 d-flex flex-column position-fixed">
            <h4 class="mb-4">Dashboard</h4>
            <ul class="nav flex-column">
                <li class="nav-item"><a href="#todo" class="nav-link" data-section="todo">ToDo</a></li>
                <li class="nav-item"><a href="#analytics" class="nav-link" data-section="analytics">Analytics</a></li>
                <li class="nav-item"><a href="#people" class="nav-link" data-section="people">People</a></li>
                <li class="nav-item"><a href="#products" class="nav-link" data-section="products">Products</a></li>
                <li class="nav-item"><a href="#settings" class="nav-link" data-section="null">Settings</a></li>
                <li class="nav-item"><a href="#" class="nav-link" onclick="logout()">Logout</a></li>
            </ul>
        </aside>

        <main class="col-10 flex-grow-1 p-4">

            <section id="todo-section">
                <h1>Today</h1>
                <section class="task-section">
                    <h6>Design</h6>
                </section>
                <section class="task-section">
                    <h6>Personal</h6>
                </section>
                <section class="task-section">
                    <h6>House</h6>
                </section>
                <section class="task-section" id="tasks-other">
                    <h6>Others</h6>
                </section class="task-section">

                <form id="task-form" class="d-flex g-3 mt-5">
                    <input type="text" class="form-control me-3" id="new-task" placeholder="Write a task...">
                    <button type="submit" class="btn btn-primary">Add</button>
                </form>
            </section>

            <section id="analytics-section">
                <h2>Sales Analytics</h2>

                <div class="d-flex pa-5 g-3 flex-column">
                    <canvas id="salesByDayChart"></canvas>
                    <canvas id="leadsByDayChart"></canvas>
                    <canvas id="repeatPurchasesChart"></canvas>
                    <canvas id="revenueByMonthChart"></canvas>
                    <canvas id="salesByManagerChart"></canvas>
                </div>

                <h3>Revenue by Manager</h3>
                <table id="managersTable" class="display"></table>

                <h3>Low-turnover Products</h3>
                <table id="productsTable" class="display"></table>
            </section>

            <section id="people-section">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>People Directory</h2>
                    <div class="d-flex">
                        <input type="text" id="search-people" class="form-control me-2" placeholder="Search people...">
                        <button class="btn btn-outline-secondary" id="sort-people">
                            <i class="bi bi-sort-alpha-down"></i> Sort
                        </button>
                    </div>
                </div>

                <div class="row" id="people-cards-container">

                    <div class="col-12 text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2">Loading people data...</p>
                    </div>
                </div>

            </section>

            <section id="products-section">
                <!-- Products -->
            </section>
        </main>
    
    `;
}

function logout() {
    localStorage.removeItem("userSession");
    location.reload();
}
