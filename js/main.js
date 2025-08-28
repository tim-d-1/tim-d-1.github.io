document.addEventListener('DOMContentLoaded', function () {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
    toggleTheme(theme);
});

document.querySelectorAll("[data-section]").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        document.querySelectorAll("main>section").forEach(sec => {
            if ((link.dataset.section + "-section") === sec.id) {
                document.getElementById(sec.id).style.setProperty('display', 'block');
                if (sec.id == 'todo-section') document.getElementById('todo-controls').style.setProperty('display', 'block');
                return;
            }
            sec.style.setProperty('display', 'none');
            if (sec.id == 'todo-section') document.getElementById('todo-controls').style.setProperty('display', 'none');
        });
    });
});

function toggleTheme(systemChoice, isToggle) {
    let theme = localStorage.getItem("theme");

    theme = isToggle
        ? (theme === "light" ? "dark" : "light")
        : (theme || systemChoice);

    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-bs-theme", theme);
    themeToggle.textContent = theme === "light" ? "🌙" : "☀️";
}


// Theme toggle
let themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", () => {
    toggleTheme(null, true);
});

const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992) {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    }
});
