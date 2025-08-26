document.addEventListener('DOMContentLoaded', function () {
    toggleTheme();
});

document.querySelectorAll("[data-section]").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        document.querySelectorAll(".section").forEach(sec => sec.classList.add("d-none"));
        const sectionId = link.dataset.section + "-section";
        document.getElementById(sectionId).classList.remove("d-none");
    });
});

function toggleTheme(isToggle) {
    let theme = localStorage.getItem("theme") || "light";

    if (isToggle) {
        theme = theme === "light" ? "dark" : "light";
    }

    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-bs-theme", theme);
    themeToggle.textContent = theme === "light" ? "🌙" : "☀️";
}


// Theme toggle
let themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", () => {
    toggleTheme(true);
});