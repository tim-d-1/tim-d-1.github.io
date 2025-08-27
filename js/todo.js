let draggedItem = null;
let clone = null;
let touchTimeout = null;
let isDragging = false;
const mobilePressThreshold = 250;

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
                <button class="btn btn-sm btn-outline-danger delete-btn">🗑️</button>
            `;

    makeDraggable(newTask);
    document.getElementById('tasks-other').appendChild(newTask);
    input.value = '';
    saveTasks();
});


function loadTasks() {
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

window.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});

function makeDraggable(task) {
    const deleteBtn = task.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        task.remove();
        saveTasks();
    });

    const span = task.querySelector('span');
    span.addEventListener('click', function (e) {
        e.stopPropagation();
        enableEdit(span);
    });

    // Desktop drag
    task.setAttribute('draggable', true);
    task.addEventListener('dragstart', () => {
        draggedItem = task;
        task.classList.add('dragging');
    });
    task.addEventListener('dragend', () => {
        draggedItem = null;
        task.classList.remove('dragging');
        saveTasks();
    });
}

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

function moveClone(touch) {
    clone.style.left = touch.pageX - clone.offsetWidth / 2 + 'px';
    clone.style.top = touch.pageY - clone.offsetHeight / 2 + 'px';
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

document.querySelectorAll('.task').forEach(t => {
    makeDraggable(t);
});

// Desktop section drop
document.querySelectorAll('.task-section').forEach(section => {
    section.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(section, e.clientY);
        if (!afterElement) section.appendChild(draggedItem);
        else section.insertBefore(draggedItem, afterElement);
    });
});

function saveTasks() {
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

// Save checkbox changes
document.addEventListener('change', e => {
    if (e.target.matches('.task input[type="checkbox"]')) {
        saveTasks();
    }
});