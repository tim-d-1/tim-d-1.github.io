import { makeDraggable } from "./drag.js";
import { loadTasks, saveTasks } from "./data.js";

document.getElementById('task-form').addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('new-task');
    const value = input.value.trim();
    if (!value) return;

    const newTask = document.createElement('label');
    newTask.className = 'task d-flex';
    newTask.innerHTML = `
                <input type="checkbox">
                <div class="checkmark"></div>
                <span>${value}</span>
                <button class="btn btn-sm ms-auto btn-outline-danger delete-btn">🗑️</button>
            `;

    makeDraggable(newTask);
    document.getElementById('tasks-other').appendChild(newTask);
    input.value = '';
    saveTasks();
});

function enableEdit(span) {
    const currentText = span.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.className = "form-control form-control-sm";

    // Replace span with input
    span.replaceWith(input);
    input.focus();

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const newSpan = document.createElement("span");
            newSpan.className = "task-text flex-grow-1";
            newSpan.textContent = input.value.trim() || currentText;
            newSpan.addEventListener('click', function (e) {
                e.stopPropagation();
                enableEdit(span);
            });
            input.replaceWith(newSpan);

            saveTasks();
        }
    });
}

