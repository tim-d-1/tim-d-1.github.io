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

window.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});

document.addEventListener('change', e => {
    if (e.target.matches('.task input[type="checkbox"]')) {
        saveTasks();
    }
});