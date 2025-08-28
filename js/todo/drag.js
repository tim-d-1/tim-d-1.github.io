import { saveTasks, loadTasks } from "./data.js";
import { enableEdit } from "./todo.js";

let draggedItem = null;
let clone = null;
let touchTimeout = null;
let isDragging = false;
const mobilePressThreshold = 250;

export function makeDraggable(task) {
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

    // Mobile touch
    task.addEventListener('touchstart', (e) => {
        touchTimeout = setTimeout(() => {
            draggedItem = task;
            isDragging = true;

            clone = task.cloneNode(true);
            clone.style.position = 'absolute';
            clone.style.pointerEvents = 'none';
            clone.style.opacity = '0.7';
            clone.style.zIndex = '1000';
            document.body.appendChild(clone);

            moveClone(e.touches[0]);
        }, mobilePressThreshold);
    });

    task.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();
        moveClone(e.touches[0]);
    });

    task.addEventListener('touchend', (e) => {
        clearTimeout(touchTimeout);
        if (!isDragging) return;

        clone.remove();
        clone = null;

        const dropTarget = document.elementFromPoint(
            e.changedTouches[0].clientX,
            e.changedTouches[0].clientY
        )?.closest('.task-section');

        if (dropTarget) {
            const afterElement = getDragAfterElement(dropTarget, e.changedTouches[0].clientY);
            if (!afterElement) dropTarget.appendChild(draggedItem);
            else dropTarget.insertBefore(draggedItem, afterElement);
        }

        draggedItem = null;
        isDragging = false;
        saveTasks();
    });

    task.addEventListener('touchcancel', () => {
        clearTimeout(touchTimeout);
        if (clone) clone.remove();
        clone = null;
        draggedItem = null;
        isDragging = false;
    });
}

export function getDragAfterElement(container, y) {
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

document.querySelectorAll('.task-section').forEach(section => {
    section.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(section, e.clientY);
        if (!afterElement) section.appendChild(draggedItem);
        else section.insertBefore(draggedItem, afterElement);
    });
});

document.querySelectorAll('.task').forEach(t => {
    makeDraggable(t);
});

export function moveClone(touch) {
    clone.style.left = touch.pageX - clone.offsetWidth / 2 + 'px';
    clone.style.top = touch.pageY - clone.offsetHeight / 2 + 'px';
}
