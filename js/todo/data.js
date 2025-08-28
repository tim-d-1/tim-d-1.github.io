import { makeDraggable } from "./drag.js";

export function loadTasks() {
    const data = JSON.parse(localStorage.getItem('tasksData') || '[]');
    if (!data.length) return;

    const containerSections = document.querySelectorAll('.task-section');

    data.forEach((sectionData, index) => {
        const section = containerSections[index];
        if (!section) return;

        section.querySelectorAll('.task').forEach(t => t.remove());

        sectionData.tasks.forEach(taskData => {
            const newTask = document.createElement('label');
            newTask.classList = "task d-flex";
            newTask.innerHTML = `
                <input type="checkbox" ${taskData.checked ? 'checked' : ''}>
                <div class="checkmark"></div>
                <span>${taskData.text}</span>
                <button class="btn btn-sm ms-auto btn-outline-danger delete-btn">🗑️</button>
            `;
            makeDraggable(newTask);
            section.appendChild(newTask);
        });
    });
}

export function saveTasks() {
    const sections = document.querySelectorAll('.task-section');
    const data = [];

    sections.forEach(section => {
        const sectionTitle = section.querySelector('h6')?.textContent || '';
        const tasks = [...section.querySelectorAll('.task')].map(task => {
            return {
                text: task.querySelector('span').textContent,
                checked: task.querySelector('input[type="checkbox"]').checked
            };
        });
        data.push({ title: sectionTitle, tasks });
    });

    localStorage.setItem('tasksData', JSON.stringify(data));
}

let currentFilter = "all";

function applyFilter() {
    document.querySelectorAll(".task").forEach(task => {
        const isChecked = task.querySelector('input[type="checkbox"]').checked;

        if (currentFilter === "completed" && !isChecked) {
            task.classList.remove('d-flex');
            task.classList.add('d-none');
        } else if (currentFilter === "pending" && isChecked) {
            task.classList.remove('d-flex');
            task.classList.add('d-none');
        } else {
            task.classList.remove('d-none');
            task.classList.add('d-flex');
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    applyFilter();
});

document.addEventListener('change', e => {
    if (e.target.matches('.task input[type="checkbox"]')) {
        saveTasks();
    }
    applyFilter();
});

document.querySelectorAll('#todo-controls>button').forEach(b => b.addEventListener("click", e => {
    const btn = e.target;
    currentFilter = btn.dataset.filter;

    document.querySelectorAll("#todo-controls>button")
        .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    applyFilter();
}));